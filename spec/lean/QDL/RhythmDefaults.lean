import QDL.Design

/-! An omitted rhythm keeps source unchanged and uses a validated presentation fallback. -/
namespace QDL.RhythmDefaults

def fallback : Rhythm := {
  rate := 1, breath := 6/100, wave := 55/1000, waveNumber := 16/10, lag := 9/10, asymmetry := 28/100, overtone := 17/100
}

theorem fallback_valid : fallback.Valid := by
  norm_num [fallback, Rhythm.Valid, Bounded]

def effective (motion : Motion) : Rhythm := motion.rhythm.getD fallback

theorem effective_valid {motion : Motion} (valid : motion.Valid) : (effective motion).Valid := by
  cases h : motion.rhythm with
  | none => simpa [effective, h] using fallback_valid
  | some rhythm =>
      have hr : rhythm.Valid := by simpa [h] using valid.2
      simpa [effective, h] using hr

end QDL.RhythmDefaults
