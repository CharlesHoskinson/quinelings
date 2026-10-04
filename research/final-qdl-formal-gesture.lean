import Mathlib
namespace FinalQDLGesture
noncomputable def H (z : ℝ) := 6*z^5 - 15*z^4 + 10*z^3
noncomputable def V (z : ℝ) := 30*z^2*(1-z)^2
noncomputable def A (z : ℝ) := 60*z*(1-z)*(1-2*z)
theorem H_factor (z : ℝ) : H z = z^3*(6*(1-z)^2+3*(1-z)+1) := by unfold H; ring
theorem complement_factor (z : ℝ) : 1-H z = (1-z)^3*(6*z^2+3*z+1) := by unfold H; ring
theorem H_bounds {z : ℝ} (hz : 0 ≤ z) (hz1 : z ≤ 1) : 0 ≤ H z ∧ H z ≤ 1 := by
  have hnon : 0 ≤ 1-z := by linarith
  constructor
  · rw [H_factor]; positivity
  · have hp : 0 ≤ 1-H z := by rw [complement_factor]; positivity
    linarith

theorem H_derivative (z : ℝ) : HasDerivAt H (V z) z := by
  have h := (((hasDerivAt_pow 5 z).const_mul 6).sub ((hasDerivAt_pow 4 z).const_mul 15)).add ((hasDerivAt_pow 3 z).const_mul 10)
  convert h using 1
  · ext x; simp [H]
  · simp [V]; ring

theorem V_derivative (z : ℝ) : HasDerivAt V (A z) z := by
  have h := (((hasDerivAt_pow 2 z).const_mul 30).sub ((hasDerivAt_pow 3 z).const_mul 60)).add ((hasDerivAt_pow 4 z).const_mul 30)
  convert h using 1
  · ext x; simp [V]; ring
  · simp [A]; ring

theorem endpoints : H 0=0 ∧ H 1=1 ∧ V 0=0 ∧ V 1=0 ∧ A 0=0 ∧ A 1=0 := by norm_num [H,V,A]
theorem velocity_nonnegative (z : ℝ) : 0 ≤ V z := by unfold V; positivity

theorem convex_interval {lo hi a b z : ℝ} (ha : lo ≤ a ∧ a ≤ hi) (hb : lo ≤ b ∧ b ≤ hi) (hz : 0 ≤ z ∧ z ≤ 1) :
 lo ≤ (1-H z)*a+H z*b ∧ (1-H z)*a+H z*b ≤ hi := by
 have hh := H_bounds hz.1 hz.2
 have one : 0 ≤ 1-H z := by linarith
 have al := mul_le_mul_of_nonneg_left ha.1 one
 have bl := mul_le_mul_of_nonneg_left hb.1 hh.1
 have au := mul_le_mul_of_nonneg_left ha.2 one
 have bu := mul_le_mul_of_nonneg_left hb.2 hh.1
 constructor <;> nlinarith
#print axioms H_bounds
#print axioms H_derivative
#print axioms V_derivative
#print axioms convex_interval
end FinalQDLGesture
