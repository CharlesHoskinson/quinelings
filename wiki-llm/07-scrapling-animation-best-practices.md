# Scrapling Online Research: Continuous Organic Animation, Fluid Flow & Camera Stabilization Best Practices

## Core Synthesis for Quinelings 2.0 ('Flow Like Water, Zero Camera Shake')

1. **Zero Camera Shake (Fixed Portrait Bounds Locking)**: Never recompute `minX, maxX, minY, maxY, midX, midY, span` from moving vertex positions on each frame! Recomputing extrema per-frame couples local surface waves into global camera translation and zoom jitter. Instead, compute `WovenBody.portraitFrame(body)` **once** when the body is compiled (or use a critically damped spring with a wide deadzone during preset transitions) and lock `(cx, cy, cz, span)` across all phases.

2. **Continuous Phase-Ring Interpolation (Sub-Bucket Hermite/Linear Blending)**: In `PersistentPhaseRing` (`designer8_quineling.js` and `slideshow.html`), never snap discretely to the nearest phase bucket `buckets[idx]`. Instead, compute fractional bucket coordinate `f = (normPhase / (2*PI)) * bucketCount`, `idx0 = floor(f) % N`, `idx1 = (idx0 + 1) % N`, `t = smoothstep(f - floor(f))`, and blend smoothly between `bucket0` and `bucket1` while advecting with continuous traveling waves!

3. **Decouple Expensive Caustic Root-Finding from 60/120fps Render Loop**: `WovenBody.frame(..., { crests: true })` runs 480x20 bisection steps (`~18ms`). Never run `crests: true` synchronously on every frame in `slideshow.html` or `motion.html`. Pre-bake a 48-bucket `PersistentPhaseRing` (or advect pre-solved caustic polylines smoothly using continuous harmonic phase transport) so every frame renders in `< 0.8ms` at locked 60/120 FPS.

4. **Frame-Rate Independent Exponential Decay & Second-Order Critically Damped Springs**: Replace fixed-step lerps and abrupt parameter jumps (`activeOwner`, `recursionDepth`, `outcome`, `tiltX`, `tiltY`, `phaseVelocity`) with `y += (target - y) * (1 - Math.exp(-dt * lambda))` or critically damped 2nd-order spring integration so every transition flows like water.

5. **Laminar Streamline &Curl-Free Harmonic Advection**: Use divergence-free / laminar phase waves (`sin(2*PI*u - phi)`, `cos(2*PI*u - phi)`) with C^2 quintic envelopes (`6t^5 - 15t^4 + 10t^3`) rather than high-frequency discontinuous noise (`sin(17*phi)`), replacing harsh fault jitter with smooth, viscous vortex curling.

## Inigo Quilez — Useful Little Functions (Smoothstep, Quintic, Impulse, Cubic Pulse)
- **URL**: `https://iquilezles.org/articles/functions/`
- **Status**: HTTP 200
- **Scraped Excerpts**:
- Inigo Quilez :: computer graphics, maths, shaders, fractals, demoscene
- When writing shader or during any procedural creation process (texturing, modeling, shading, animation...) you often find yourself modifying signals in different ways so they behave the way you need. It is common to use smoothstep() to threshold some values, o
- () for attenuation, etc etc. All these functions are often conveniently available by default in most languages. However there are some operations that are also relatively used that don't come by default in any language. The following is a list of some of the f
- (x,e) creates a discontinuity. So instead, let
- be a blending width, and smoothly blend the epsilon
- into the signal approaches as it approaches zero:
- Another piece-wise function to get a smooth identiy or smooth absolute value, is this one, which happens to be the one we use for the traditional smooth minimum of SDFs (the quadratic polynomial):
- A different way to achieve a near identity is through the square root of a biased square. I saw this technique first in a shader by user "omeometo" in Shadertoy. This approach can be a bit slower than the cubic above, depending on the hardware, but I find myse
- If you use smoothstep for a velocity signal (say, you want to smoothly accelerate a stationary object into constant velocity motion), you need to integrate smoothstep() over time in order to get the actual position of value of the animation. The function below
- Impulses are great for triggering behaviours or making envelopes for music or animation. Basically, for anything that grows fast and then decays slowly. The following is an exponential impulse function. Use

## Inigo Quilez — Smooth Minimum & Organic Blending
- **URL**: `https://iquilezles.org/articles/smin/`
- **Status**: HTTP 200
- **Scraped Excerpts**:
- Inigo Quilez :: computer graphics, maths, shaders, fractals, demoscene
- One of the basic building blocks of Signed Distance Field (SDF) modeling based on
- (as opposed to Grids or Neural Networks) is the Smooth-Minimum operator or Smooth-Union. This is similar to a regular Minimum/Union operator, but, well "smooth". This means that where the regular or non-smooth Minimum/Union takes two input SDFs
- and returns the closest one of the two, effectively combining both into a single field (for the distance to the combined shape is the distance to whichever piece is closest), the Smooth version combines the two shapes by blending and melting them together, if 
- The images above are an example of using the smooth minimum to sculpt a human face. First we have the regular minimum or union based field, where all the base primitives are clearly visible. Then we can see the Smooth-minimum or Smooth-union, where the shapes 
- So the regular Minimum simply takes the lowest valued of two SDFs
- Most languages come with this function already defined, either as a hardware instruction (most likely) or through a software emulation with an actual branch like in the code above (most unlikely).
- Now, the Smooth-minimum must achieve a smooth, non-binary transition between the values of
- are close enough to each other within some tolerance
- (measured in regular, distance units). So, when functions or surfaces are close enough to each other, the will blend or melt together.

## Rory Driscoll — Frame-Rate Independent Damping using Lerp
- **URL**: `https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/`
- **Status**: HTTP 200
- **Scraped Excerpts**:
- Frame Rate Independent Damping using Lerp – CodeItNow
- A quick aside for those not familiar with Unity: Each script has three different update functions that can be called.
- is a version that’s called well, later on in the frame. Both of these should use the global (yikes) Time.deltaTime to access the variable frame time.
- uses Time.fixedTimeDelta and runs on a fixed timestep, so can potentially run multiple times per frame.
- – the correct usage of linear interpolationÂ for damping a value. You have a value,
- , and you’d like to smoothly move it towards another value
- , so you decide to use linear interpolation with some arbitrary rate
- . If you do something like this in your variable rate update function (Update or LateUpdate), then you have a problem:
- This code is broken because it takes a chunk out between
- and we know that the frame rate is variable, so the smoothing will also be variable.

## Lisyarus — Exponential Smoothing & Critically Damped Springs
- **URL**: `https://lisyarus.github.io/blog/posts/exponential-smoothing.html`
- **Status**: HTTP 200
- **Scraped Excerpts**:
- My favourite animation trick: exponential smoothing | lisyarus blog
- My favourite animation trick: exponential smoothing
- There's a certain simple animation thing that I've been using almost since I've ever started doing anything related to graphics. I use it for rotating & moving the camera, for moving figures in a turn-based game, for moving UI elements, for smoothing volume ch
- , everywhere! So I decided I'll write about it. The trick itself is nothing new, – in fact, you've probably already heard about or even used it, – but I'll also show it in some examples and explain how it works mathematically :)
- Speaking of UI, say you're making some UI component, maybe a toggle button. Something like this (click it!):
- This simply computes the position of the switch as a function of its state:
- This works perfectly, but feels a bit lifeless. Adding some
- to it would be cool! Animations are not just a fancy visual thing, they help the user understand what's going on. Instead of teleporting the toggle indicator to its new position, let's move it smoothly:
- The downside is that we need to run some updating animation now:
- position.x += (turned_on ? 1 : -1) * speed * dt;

## MDN — Window.requestAnimationFrame Timing & Delta Clamping
- **URL**: `https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame`
- **Status**: HTTP 200
- **Scraped Excerpts**:
- Window: requestAnimationFrame() method - Web APIs | MDN
- This feature is well established and works across many devices and browser versions. It’s been available across browsers since July 2015.
- browser you wish to perform an animation. It requests the browser to call a
- user-supplied callback function before the next repaint.
- The frequency of calls to the callback function will generally match the display
- refresh rate. The most common refresh rate is 60hz,
- (60 cycles/frames per second), though 75hz, 120hz, and 144hz are also widely used.
- calls are paused in most browsers when running in
- Be sure always to use the first argument (or some other method for
- getting the current time) to calculate how much the animation will progress in
