#!/usr/bin/env python3
"""
build_charlessong_90s.py
------------------------
Produces an exact 90.000000-second (3,969,000 samples @ 44,100 Hz, 5,400 frames @ 60fps)
master cut of C:\\Users\\charl\\OneDrive\\Desktop\\charlessong.mp3 with phase-aligned
equal-power cosine crossfades, preserving 100% of the lyrics and the synthwave drop.
Uses Python standard library `wave` + `numpy` + `ffmpeg`.
"""
import os
import subprocess
import wave
import numpy as np

SR = 44100
TARGET_SAMPLES = 90 * SR  # 3,969,000 samples (exact 90.000000s = 5,400 frames @ 60fps)

SRC_MP3 = "/home/charles/sherlock-bench/assets/audio/charlessong_original.mp3"
TMP_WAV = "/tmp/charlessong_orig_44100.wav"
OUT_WAV = "/home/charles/sherlock-bench/assets/audio/charlessong_90s.wav"
OUT_MP3 = "/home/charles/sherlock-bench/assets/audio/charlessong_90s.mp3"
WIKI_MP3 = "/home/charles/repos/quinelings/wiki-llm/audio/charlessong_90s.mp3"

# 5-Segment Beat-Locked Edit Table (Strategy A - Preserves 100% of Lyrics & Climax Drop)
SEGMENTS = [
    (0.000,   38.580),  # Seg 1: Atmospheric Opening + Verse 1 + Verse 2 ("We'll begin with a spin...")
    (46.200,  71.220),  # Seg 2: Chorus 1 ("If you want to view paradise... Want to change the world, there's nothing to it")
    (78.640,  94.060),  # Seg 3: Climax Instrumental Synthwave Drop (Pelagic Colony Pullback)
    (102.080, 113.700), # Seg 4: Finale Vocal ("There is no life I know... Living there, you'll be free, if you truly wish to be")
    (114.400, 118.740), # Seg 5: Resolving Synth Tail ("Life is what we make of it.")
]

XFADES = [0.120, 0.120, 0.140, 0.120]


def read_wav_stereo(path: str):
    with wave.open(path, "rb") as wf:
        sr = wf.getframerate()
        nch = wf.getnchannels()
        nframes = wf.getnframes()
        raw = wf.readframes(nframes)
    data = np.frombuffer(raw, dtype=np.int16).reshape(-1, nch)
    return sr, data


def write_wav_stereo(path: str, sr: int, data_i16: np.ndarray):
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(data_i16.tobytes())


def phase_align_offset(tail_mono: np.ndarray, head_mono: np.ndarray, max_shift: int) -> int:
    best_corr = -1e18
    best_shift = 0
    L = len(tail_mono)
    t_norm = tail_mono - np.mean(tail_mono)
    for shift in range(-max_shift, max_shift + 1):
        seg = head_mono[max_shift + shift : max_shift + shift + L]
        s_norm = seg - np.mean(seg)
        corr = float(np.dot(t_norm, s_norm))
        if corr > best_corr:
            best_corr = corr
            best_shift = shift
    return best_shift


def equal_power_crossfade(seg_a: np.ndarray, seg_b: np.ndarray, n_xfade: int) -> np.ndarray:
    theta = np.linspace(0.0, 0.5 * np.pi, n_xfade, endpoint=False, dtype=np.float64)[:, None]
    gain_a = np.cos(theta)
    gain_b = np.sin(theta)
    blended = seg_a[-n_xfade:] * gain_a + seg_b[:n_xfade] * gain_b
    return np.vstack([seg_a[:-n_xfade], blended, seg_b[n_xfade:]])


def build_90s_master():
    os.makedirs(os.path.dirname(OUT_MP3), exist_ok=True)
    os.makedirs(os.path.dirname(WIKI_MP3), exist_ok=True)

    subprocess.run([
        "ffmpeg", "-y", "-i", SRC_MP3,
        "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", TMP_WAV
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    sr, data_i16 = read_wav_stereo(TMP_WAV)
    assert sr == SR, f"Expected {SR} Hz, got {sr} Hz"
    audio = data_i16.astype(np.float64) / 32768.0
    mono = 0.5 * (audio[:, 0] + audio[:, 1])

    s0, e0 = int(round(SEGMENTS[0][0] * SR)), int(round(SEGMENTS[0][1] * SR))
    out = audio[s0:e0].copy()

    max_shift = int(0.018 * SR)  # +/- 18ms phase-alignment search window
    for idx in range(1, len(SEGMENTS)):
        n_xf = int(round(XFADES[idx - 1] * SR))
        s_nom = int(round(SEGMENTS[idx][0] * SR))
        e_nom = int(round(SEGMENTS[idx][1] * SR))

        tail_mono = mono[int(round(SEGMENTS[idx - 1][1] * SR)) - n_xf : int(round(SEGMENTS[idx - 1][1] * SR))]
        search_head = mono[s_nom - max_shift : s_nom + max_shift + n_xf]
        shift = phase_align_offset(tail_mono, search_head, max_shift)

        s_aligned = s_nom + shift
        e_aligned = min(len(audio), e_nom + shift)
        seg_next = audio[s_aligned:e_aligned].copy()

        out = equal_power_crossfade(out, seg_next, n_xf)
        print(f"Splice {idx}: nominal={SEGMENTS[idx][0]:.3f}s, phase_shift={shift:+d} samples ({shift*1000/SR:+.2f}ms), xfade={n_xf/SR*1000:.0f}ms")

    if len(out) > TARGET_SAMPLES:
        out = out[:TARGET_SAMPLES]
    elif len(out) < TARGET_SAMPLES:
        pad = np.zeros((TARGET_SAMPLES - len(out), 2), dtype=np.float64)
        out = np.vstack([out, pad])

    n_in = int(0.015 * SR)
    out[:n_in] *= (0.5 * (1.0 - np.cos(np.pi * np.linspace(0.0, 1.0, n_in))))[:, None]

    n_out = int(2.500 * SR)
    fade_out = (0.5 * (1.0 + np.cos(np.pi * np.linspace(0.0, 1.0, n_out)))) ** 1.35
    out[-n_out:] *= fade_out[:, None]

    assert out.shape == (TARGET_SAMPLES, 2), f"Invalid output shape: {out.shape}"
    out_i16 = np.clip(np.round(out * 32767.0), -32768, 32767).astype(np.int16)
    write_wav_stereo(OUT_WAV, SR, out_i16)

    subprocess.run([
        "ffmpeg", "-y", "-i", OUT_WAV,
        "-ar", str(SR), "-ac", "2", "-c:a", "libmp3lame", "-b:a", "256k", OUT_MP3
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    subprocess.run(["cp", OUT_MP3, WIKI_MP3], check=True)
    print(f"SUCCESS: Wrote {OUT_WAV} ({len(out_i16)} samples = {len(out_i16)/SR:.6f}s) and {OUT_MP3}")


if __name__ == "__main__":
    build_90s_master()
