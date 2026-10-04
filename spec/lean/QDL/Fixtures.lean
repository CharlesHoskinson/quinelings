-- Generated from qdl.js and the ten library families. Run npm run lean:fixtures.
import QDL.Design
import QDL.ChromaSyntax
import QDL.RhythmDefaults

namespace QDL.Fixtures

def runtimeDefault : Design := {
  formatMarker := 1
  family := .filament
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0038 / 1000), rhythm := some { mode := .periodic, rate := (1), breath := (006 / 100), wave := (0055 / 1000), waveNumber := (16 / 10), lag := (09 / 10), asymmetry := (028 / 100), overtone := (017 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (016 / 100), folds := 7, taper := (065 / 100), asymmetry := (025 / 100), depth := (028 / 100), twist := (19 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (038 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem runtimeDefault_valid : runtimeDefault.Valid := by
  norm_num [runtimeDefault, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def runtimeFallback : Design := {
  formatMarker := 1
  family := .filament
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0038 / 1000), rhythm := some { mode := .periodic, rate := (1), breath := (006 / 100), wave := (0055 / 1000), waveNumber := (16 / 10), lag := (09 / 10), asymmetry := (028 / 100), overtone := (017 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (016 / 100), folds := 7, taper := (065 / 100), asymmetry := (025 / 100), depth := (028 / 100), twist := (19 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (038 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem fallback_matches_runtime : runtimeFallback.motion.rhythm = some RhythmDefaults.fallback := by
  rfl

def lanternkeeper : Design := {
  formatMarker := 1
  family := .filament
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0038 / 1000), rhythm := some { mode := .periodic, rate := (1), breath := (006 / 100), wave := (0055 / 1000), waveNumber := (16 / 10), lag := (09 / 10), asymmetry := (028 / 100), overtone := (017 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (016 / 100), folds := 7, taper := (065 / 100), asymmetry := (025 / 100), depth := (028 / 100), twist := (19 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (038 / 100) }
  chroma := some { strength := (085 / 100), lens := some { id := "fault-score", label := "Fault score", unit := "", lower := (0), upper := (1), threshold := some (0625 / 1000), bindings := [{ node := "faultScore", path := [] }] } }
}

theorem lanternkeeper_valid : lanternkeeper.Valid := by
  norm_num [lanternkeeper, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]
  decide

def wayfinder : Design := {
  formatMarker := 1
  family := .comet
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0038 / 1000), rhythm := some { mode := .periodic, rate := (115 / 100), breath := (0045 / 1000), wave := (009 / 100), waveNumber := (28 / 10), lag := (15 / 10), asymmetry := (048 / 100), overtone := (02 / 10) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 24, crests := 4, spread := (014 / 100), folds := 6, taper := (16 / 10), asymmetry := (025 / 100), depth := (025 / 100), twist := (16 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-016 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (025 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem wayfinder_valid : wayfinder.Valid := by
  norm_num [wayfinder, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def swarmwarden : Design := {
  formatMarker := 1
  family := .coral
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0034 / 1000), rhythm := some { mode := .quasiperiodic, rate := (055 / 100), breath := (0035 / 1000), wave := (004 / 100), waveNumber := (24 / 10), lag := (125 / 100), asymmetry := (018 / 100), overtone := (025 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 20, crests := 4, spread := (012 / 100), folds := 4, taper := (07 / 10), asymmetry := (025 / 100), depth := (024 / 100), twist := (13 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (002 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (055 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem swarmwarden_valid : swarmwarden.Valid := by
  norm_num [swarmwarden, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def echoweaver : Design := {
  formatMarker := 1
  family := .jelly
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0029 / 1000), rhythm := some { mode := .periodic, rate := (08 / 10), breath := (014 / 100), wave := (0075 / 1000), waveNumber := (12 / 10), lag := (11 / 10), asymmetry := (065 / 100), overtone := (02 / 10) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (012 / 100), folds := 5, taper := (14 / 10), asymmetry := (025 / 100), depth := (03 / 10), twist := (16 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (008 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (028 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem echoweaver_valid : echoweaver.Valid := by
  norm_num [echoweaver, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def raincatcher : Design := {
  formatMarker := 1
  family := .ribbon
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0038 / 1000), rhythm := some { mode := .periodic, rate := (085 / 100), breath := (0055 / 1000), wave := (0095 / 1000), waveNumber := (26 / 10), lag := (14 / 10), asymmetry := (032 / 100), overtone := (023 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (019 / 100), folds := 6, taper := (055 / 100), asymmetry := (025 / 100), depth := (03 / 10), twist := (21 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-017 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (045 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem raincatcher_valid : raincatcher.Valid := by
  norm_num [raincatcher, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def tidemender : Design := {
  formatMarker := 1
  family := .nautilus
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0028 / 1000), rhythm := some { mode := .periodic, rate := (065 / 100), breath := (008 / 100), wave := (0045 / 1000), waveNumber := (18 / 10), lag := (11 / 10), asymmetry := (045 / 100), overtone := (018 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (01 / 10), folds := 6, taper := (085 / 100), asymmetry := (025 / 100), depth := (024 / 100), twist := (15 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (036 / 100), pitch := (012 / 100), focus := (045 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem tidemender_valid : tidemender.Valid := by
  norm_num [tidemender, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def memorybloom : Design := {
  formatMarker := 1
  family := .bloom
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0026 / 1000), rhythm := some { mode := .quasiperiodic, rate := (055 / 100), breath := (011 / 100), wave := (005 / 100), waveNumber := (2), lag := (085 / 100), asymmetry := (035 / 100), overtone := (028 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 24, crests := 4, spread := (012 / 100), folds := 5, taper := (09 / 10), asymmetry := (025 / 100), depth := (023 / 100), twist := (14 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (008 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (055 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem memorybloom_valid : memorybloom.Valid := by
  norm_num [memorybloom, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def pulsekeeper : Design := {
  formatMarker := 1
  family := .torus
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (003 / 100), rhythm := some { mode := .periodic, rate := (09 / 10), breath := (0085 / 1000), wave := (0055 / 1000), waveNumber := (3), lag := (06 / 10), asymmetry := (025 / 100), overtone := (02 / 10) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 24, crests := 4, spread := (012 / 100), folds := 5, taper := (08 / 10), asymmetry := (025 / 100), depth := (028 / 100), twist := (17 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (009 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (05 / 10) }
  chroma := some { strength := (085 / 100) }
}

theorem pulsekeeper_valid : pulsekeeper.Valid := by
  norm_num [pulsekeeper, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def threadsorter : Design := {
  formatMarker := 1
  family := .moth
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0031 / 1000), rhythm := some { mode := .periodic, rate := (135 / 100), breath := (0045 / 1000), wave := (0075 / 1000), waveNumber := (1), lag := (055 / 100), asymmetry := (04 / 10), overtone := (022 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (017 / 100), folds := 5, taper := (08 / 10), asymmetry := (025 / 100), depth := (025 / 100), twist := (18 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (-022 / 100), pitch := (012 / 100), focus := (045 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem threadsorter_valid : threadsorter.Valid := by
  norm_num [threadsorter, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

def seedbank : Design := {
  formatMarker := 1
  family := .seed
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (003 / 100), rhythm := some { mode := .periodic, rate := (06 / 10), breath := (0075 / 1000), wave := (0035 / 1000), waveNumber := (14 / 10), lag := (08 / 10), asymmetry := (03 / 10), overtone := (012 / 100) } }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 24, crests := 4, spread := (013 / 100), folds := 6, taper := (08 / 10), asymmetry := (025 / 100), depth := (025 / 100), twist := (18 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (042 / 100) }
  chroma := some { strength := (085 / 100) }
}

theorem seedbank_valid : seedbank.Valid := by
  norm_num [seedbank, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

theorem lanternkeeper_bindings_in_graph : (match lanternkeeper.chroma with | none => True | some c => c.BindingsInGraph ["faultSignals", "signalWeights", "inspectionEvidence", "repairPermitted", "falseGuard", "lampId", "repairOperation", "faultScore", "maintenanceNeeded", "corroboration", "evidenceState", "faultSupported", "evidenceGuard", "repairGuard", "repairPayload", "repairReceipt", "decision" ]) := by
  simp [lanternkeeper, Chroma.BindingsInGraph, ScalarLens.BindingsInGraph]

def legacyWithoutOptionalViews : Design := {
  formatMarker := 1
  family := .filament
  organ := { baseRadius := (003 / 100), degreeGain := (0004 / 1000), literalGain := (0001 / 1000), amplitude₀ := (02 / 10), amplitude₁ := (013 / 100) }
  filament := { bend := (004 / 100), frequencyGain := (007 / 100), ripple := (016 / 100) }
  motion := { phaseRate := (0038 / 1000), rhythm := none }
  ink := { ghostAlpha := (009 / 100), secondaryAlpha := (042 / 100), ridgeAlpha := (088 / 100), neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := (016 / 100), folds := 7, taper := (065 / 100), asymmetry := (025 / 100), depth := (028 / 100), twist := (19 / 10), phaseLag := (14 / 10), samples := 24000 }
  light := { recessAlpha := (0045 / 1000), crestAlpha := (058 / 100), depthContrast := (065 / 100) }
  composition := { occupancy := (076 / 100), lean := (-012 / 100), yaw := (03 / 10), pitch := (012 / 100), focus := (038 / 100) }
  chroma := none
}

theorem legacyWithoutOptionalViews_valid : legacyWithoutOptionalViews.Valid := by
  norm_num [legacyWithoutOptionalViews, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

theorem default_matches_runtime : runtimeDefault = defaultDesign := by
  rfl

example : validateDesign { defaultDesign with surface := { defaultDesign.surface with samples := 24001 } } = false := by
  apply (validateDesign_reject_iff _).mpr
  norm_num [defaultDesign, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

example : validateDesign { defaultDesign with composition := { defaultDesign.composition with occupancy := 1 } } = false := by
  apply (validateDesign_reject_iff _).mpr
  norm_num [defaultDesign, Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid, Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, ScalarLens.Valid, LensBinding.Valid, LensPathSegment.Valid, Bounded]

end QDL.Fixtures
