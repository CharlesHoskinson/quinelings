# ElevenLabs Official Markdown Documentation (Music & Sound Effects)

## https://elevenlabs.io/docs/overview/capabilities/music.md

> This is a page from the ElevenLabs documentation. For a complete page index, fetch https://elevenlabs.io/docs/llms.txt. For the full documentation in a single file, fetch https://elevenlabs.io/docs/llms-full.txt.

# Eleven Music

## Overview

Eleven Music is a Text to Music model that generates studio-grade music with natural language prompts in any style. It's designed to understand intent and generate complete, context-aware audio based on your goals. The model understands both natural language and musical terminology, providing you with state-of-the-art features:

* Complete control over genre, style, and structure
* Vocals or just instrumental
* Multilingual, including English, Spanish, German, Japanese and more
* Edit the sound and lyrics of individual sections or the whole song

Listen to a sample:

<elevenlabs-audio-player audio-title="Eleven Outta Ten" audio-src="https://storage.googleapis.com/eleven-public-cdn/documentation_assets/audio/music-eleven-outta-ten.mp3" />

Created in collaboration with labels, publishers, and artists, Eleven Music is cleared for nearly all commercial uses, from film and television to podcasts and social media videos, and from advertisements to gaming. For more information on supported usage across our different plans, [see our music terms](https://elevenlabs.io/music-terms).

## Audio Reference

Audio Reference lets you upload a short audio track to guide the style and sound of a new Music v2 or v2.5 generation. This gives the model an additional creative reference alongside your text prompt.

To use Audio Reference, navigate to **Music** > **Generations** and use the **+ Reference** button in the **Prompt** section to add an audio reference.

You can upload a reference track of up to approximately 30 seconds in commonly used audio formats. Every uploaded reference is screened for copyright compliance before it can be used.

Audio Reference influences characteristics such as the overall sound, production style, instrumentation, tempo, and mood of the generated track. It does not copy or remix the uploaded audio, and the result remains a newly generated composition.

> **Note**
>
> Audio Reference is intended to guide a generation toward a similar style and sound. It is not
> designed for genre transformation — for example, uploading a jazz track and requesting a rap
> version may not produce reliable results.

Audio Reference is available with Music v2 and v2.5 on all paid plans.

## Music Finetunes

Fine-tune the ElevenLabs Music model to your sound. Music Finetunes lets you fine-tune the model to your own audio. By uploading non-copyrighted tracks you own, you can create a personalized version of our music model that consistently reflects your style, sonic identity, or brand.

Standard music generation can produce high-quality tracks, but outputs may vary significantly in instrumentation, texture, production style, and feel. Finetunes grounds generation in your specific audio identity. Once trained, every track generated with your Finetune reflects the tone, structure, and character of your dataset - while remaining a new, original composition.

Finetunes addresses three core challenges in AI music generation:

* Brands cannot build a proprietary sound with prompting alone
* Creators cannot reliably replicate their style across projects
* Musicians exploring new ideas want outputs that feel authentic to their body of work

By fine-tuning on your tracks, the custom Finetune you create captures stylistic patterns across instrumentation, tempo, production style, timbre, and vocal character.

### How it works

* Upload non-copyrighted tracks - we automatically screen them for copyright compliance
* The Finetune is ready for use in approximately 5-10 minutes
* You generate music using your custom Finetune inside ElevenCreative

> **Note**
>
> Qualifying Enterprise customers may fine-tune on proprietary intellectual property that they fully
> own and control, without third-party copyright screening. This is designed for organizations with
> catalogs they exclusively own. Contact your account manager to enable this capability.

### Curated Finetunes

In addition to custom training, ElevenCreative includes curated Finetunes created by ElevenLabs across global genres and styles, including:

* Afro House Beats
* Reggaeton
* Arabic Groove
* 70s Cambodian Rock
* 80s Nu-Disco Revival
* Mozart-Style Symphony

These are available instantly to eligible subscribers. No uploads required.

## U

## https://elevenlabs.io/docs/overview/capabilities/sound-effects.md

> This is a page from the ElevenLabs documentation. For a complete page index, fetch https://elevenlabs.io/docs/llms.txt. For the full documentation in a single file, fetch https://elevenlabs.io/docs/llms-full.txt.

# Sound effects

## Overview

ElevenLabs [sound effects](/docs/api-reference/text-to-sound-effects/convert) API turns text descriptions into high-quality sound effects with precise control over timing, style and complexity. The model understands both natural language and audio terminology, enabling you to:

* Generate cinematic sound design for films & trailers
* Create custom sound effects for games & interactive media
* Produce Foley and ambient sounds for video content

Listen to an example:

<elevenlabs-audio-player audio-title="Cinematic braam" audio-src="https://storage.googleapis.com/eleven-public-cdn/documentation_assets/audio/sfx-cinematic-braam.mp3" />

## Usage

Sound effects are generated using text descriptions & two optional parameters:

* **Duration**: Set a specific length for the generated audio (in seconds)

  * Default: Automatically determined based on the prompt
  * Range: 0.1 to 30 seconds
  * Cost: 40 credits per second when duration is specified

* **Looping**: Enable seamless looping for sound effects longer than 30 seconds

  * Creates sound effects that can be played on repeat without perceptible start/end points
  * Perfect for atmospheric sounds, ambient textures, and background elements
  * Example: Generate 30s of 'soft rain' then loop it endlessly for atmosphere in audiobooks, films, games

* **Prompt influence**: Control how strictly the model follows the prompt

  * High: More literal interpretation of the prompt
  * Low: More creative interpretation with added variations

#### [Products](/docs/eleven-creative/playground/sound-effects)

Step-by-step guide for using sound effects in ElevenLabs.

#### [Developers](/docs/eleven-api/guides/cookbooks/sound-effects)

Learn how to integrate sound effects into your application.

#### [API reference](/docs/api-reference/text-to-sound-effects/convert)

Full API reference for the Sound Effects endpoint.

### Prompting guide

#### Simple effects

For basic sound effects, use clear, concise descriptions:

* "Glass shattering on concrete"
* "Heavy wooden door creaking open"
* "Thunder rumbling in the distance"

<elevenlabs-audio-player audio-title="Wood chopping" audio-src="https://storage.googleapis.com/eleven-public-cdn/documentation_assets/audio/sfx-wood-chopping.mp3" />

#### Complex sequences

For multi-part sound effects, describe the sequence of events:

* "Footsteps on gravel, then a metallic door opens"
* "Wind whistling through trees, followed by leaves rustling"
* "Sword being drawn, then clashing with another blade"

<elevenlabs-audio-player audio-title="Walking and then falling" audio-src="https://storage.googleapis.com/eleven-public-cdn/documentation_assets/audio/sfx-walking-falling.mp3" />

#### Musical elements

The API also supports generation of musical components:

* "90s hip-hop drum loop, 90 BPM"
* "Vintage brass stabs in F minor"
* "Atmospheric synth pad with subtle modulation"

<elevenlabs-audio-player audio-title="90s drum loop" audio-src="https://storage.googleapis.com/eleven-public-cdn/documentation_assets/audio/sfx-90s-drum-loop.mp3" />

#### Audio terminology

Common terms that can enhance your prompts:

* **Impact**: Collision or contact sounds between objects, from subtle taps to dramatic crashes
* **Whoosh**: Movement through air effects, ranging from fast and ghostly to slow-spinning or rhythmic
* **Ambience**: Background environmental sounds that establish atmosphere and space
* **One-shot**: Single, non-repeating sound
* **Loop**: Repeating audio segment
* **Stem**: Isolated audio component
* **Braam**: Big, brassy cinematic hit that signals epic or dramatic moments, common in trailers
* **Glitch**: Sounds of malfunction, jittering, or erratic movement, useful for transitions and sci-fi
* **Drone**: Continuous, textured sound that creates atmosphere and suspense

## Key facts

* **Maximum duration**: 30 seconds per generation
* **Output formats**: MP3 for all effects; WAV at 48 kHz for non-looping effects
* **Looping effects**: Designed for seamless repeat playback — no audible start or end point
* **Musical elements**: Drum loops, bass lines, and melodic samples can be generated; for full music production use the [Music](/docs/overview/capabilities/music) API

## https://elevenlabs.io/docs/api-reference/music/compose.md

> This is a page from the ElevenLabs documentation. For a complete page index, fetch https://elevenlabs.io/docs/llms.txt. For the full documentation in a single file, fetch https://elevenlabs.io/docs/llms-full.txt.

# Compose music

POST https://api.elevenlabs.io/v1/music
Content-Type: application/json

Compose a song from a prompt or a composition plan.

Reference: https://elevenlabs.io/docs/api-reference/music/compose

## Servers

- `https://api.elevenlabs.io` (Production, default)
- `https://api.us.elevenlabs.io` (Production US)
- `https://api.eu.residency.elevenlabs.io` (Production EU)
- `https://api.in.residency.elevenlabs.io` (Production India)
- `https://api.sg.residency.elevenlabs.io` (Production Singapore)

## Request

### Query parameters

- `output_format` (enum, optional, default: auto) — Output format of the generated audio. Formatted as codec_sample_rate_bitrate. Use "auto" (the default) to let the API pick the best format for the selected model: mp3_44100_128 for v1 models and mp3_48000_192 for v2 models.
  - Allowed values: `auto`, `mp3_48000_128`, `mp3_48000_192`, `mp3_48000_240`, `mp3_48000_320`, `mp3_22050_32`, `mp3_24000_48`, `mp3_44100_32`, `mp3_44100_64`, `mp3_44100_96`, `mp3_44100_128`, `mp3_44100_192`, `pcm_8000`, `pcm_16000`, `pcm_22050`, `pcm_24000`, `pcm_32000`, `pcm_44100`, `pcm_48000`, `ulaw_8000`, `alaw_8000`, `opus_48000_32`, `opus_48000_64`, `opus_48000_96`, `opus_48000_128`, `opus_48000_192`
- `enable_logging` (boolean, optional, default: true) — When enable_logging is set to false zero retention mode will be used for the request. Zero retention mode may only be used by enterprise customers.

### Body (application/json)

This endpoint expects a Body_Compose_music_v1_music_post.

- `prompt` (string, optional, nullable) — A simple text prompt to generate a song from. Cannot be used in conjunction with `composition_plan`.
- `composition_plan` (BodyComposeMusicV1MusicPostCompositionPlan, optional, nullable) — A detailed composition plan to guide music generation. Cannot be used in conjunction with `prompt`.
- `music_length_ms` (integer, optional, nullable) — The length of the song to generate in milliseconds. Used only in conjunction with `prompt`. Must be between 3000ms and 600000ms. Optional - if not provided, the model will choose a length based on the prompt.
- `model_id` (enum, optional, default: music_v1) — The model to use for the generation.
  - Allowed values: `music_v1`, `music_v2`, `music_v2_5`
- `seed` (integer, optional, nullable) — Random seed to initialize the music generation process. Providing the same seed with the same parameters can help achieve more consistent results, but exact reproducibility is not guaranteed and outputs may change across system updates. Cannot be used in conjunction with prompt.
- `force_instrumental` (boolean, optional, default: false) — If true, guarantees that the generated song will be instrumental. If false, the song may or may not be instrumental depending on the `prompt`. Can only be used with `prompt`.
- `finetune_id` (string, optional, nullable) — The ID of the finetune to use for the generation
- `respect_sections_durations` (boolean, optional, default: true) — Controls how strictly section durations in the `composition_plan` are enforced. Only used with `composition_plan` and only applies to `music_v1`; for `music_v2` and `music_v2_5` section durations are always enforced and this is ignored. When false for `music_v1`, the model may adjust individual section durations for better quality and latency, while preserving the total song duration from the plan.
- `store_for_inpainting` (boolean, optional, default: false) — Whether to store the generated song for inpainting.
- `sign_with_c2pa` (boolean, optional, default: false) — Whether to sign the generated song with C2PA. Applicable only for mp3 files.

## Response

### 200

The generated audio file in the format specified

- File download.

## Errors

### 422 Unprocessable Entity Error

Validation Error

- `detail` (list of ValidationError, optional)

## Types

### BodyComposeMusicV1MusicPostCompositionPlan

A detailed composition plan to guide music generation. Cannot be used in conjunction with `prompt`.

### ValidationError

- `loc` (list of ValidationErrorLocItems, required)
- `msg` (string, required)
- `type` (string, required)

### MusicPrompt

Composition plan for the `music_v1` model. Using this field with any other model will result in an error.

- `positive_global_styles` (list o
