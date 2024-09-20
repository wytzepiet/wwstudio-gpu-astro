export function initializeBloomEffect(
	gl: WebGL2RenderingContext,
	resolution: { x: number; y: number },
	strength: number = 3,
	radius: number = 0.8
) {
	const nMips = 5; // Number of mip levels
	const bloomFactors = [1.0, 0.8, 0.6, 0.4, 1.0];
	const bloomTintColors = [
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0]
	];

	// Shader sources
	const vertexShaderSource = `
        attribute vec3 a_position;
        void main() {
            gl_Position = vec4(a_position, 1.0);
        }
    `;

	const dimFragmentShaderSource = `
		void main() {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 0.6);
		}
	`;

	const blurFragmentShaderSource = (kernelSize: number) => `
        precision mediump float;
        uniform sampler2D u_texture;
        uniform vec2 u_texSize;
        uniform vec2 u_direction;

        float gaussianPdf(float x, float sigma) {
            return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
        }

        void main() {
            vec2 tex_offset = u_direction / u_texSize; // size of a single texel
            float sigma = float(${kernelSize});  // Adjust this value for blurriness
            float weightSum = gaussianPdf(0.0, sigma);
			vec2 texcoord = gl_FragCoord.xy / u_texSize;
            vec4 diffuseSum = texture2D(u_texture, texcoord) * weightSum;
			

            for (int i = 1; i <= ${kernelSize.toFixed(0)}; i++) {
                float x = float(i);
                float w = gaussianPdf(x, sigma);
                vec2 offset = float(i) * tex_offset;

                vec4 sample1 = texture2D(u_texture, texcoord + offset);
                vec4 sample2 = texture2D(u_texture, texcoord - offset);

                diffuseSum += (sample1 + sample2) * w;
                weightSum += 2.0 * w;
            }

            vec4 result = diffuseSum / weightSum;
			gl_FragColor = result;
        }
    `;

	const compositeFragShaderSource = `
        precision mediump float;
		uniform vec2 u_resolution;
		uniform sampler2D sceneTexture;
        uniform sampler2D blurTexture1;
        uniform sampler2D blurTexture2;
        uniform sampler2D blurTexture3;
        uniform sampler2D blurTexture4;
        uniform sampler2D blurTexture5;
        uniform float bloomStrength;
        uniform float bloomRadius;
        uniform float bloomFactors[${nMips}];
        uniform vec3 bloomTintColors[${nMips}];

        float lerpBloomFactor(const in float factor) {
            float mirrorFactor = 1.2 - factor;
            return mix(factor, mirrorFactor, bloomRadius);
        }

		vec3 mapToAsymptote(vec3 val, float max, float speed) {
			return max - max / (exp(speed * val));
		}

		vec3 increaseSaturation(vec3 color, float saturation) {
    		float gray = dot(color, vec3(0.299, 0.587, 0.114)); // Grayscale value (luma)
   			 return mix(vec3(gray), color, saturation);
		}

        void main() {
			vec2 texcoord = gl_FragCoord.xy / u_resolution;

			vec4 scene = texture2D(sceneTexture, texcoord) * 1.0;

            vec4 bloom = bloomStrength * (
                lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, texcoord) +
                lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, texcoord) +
                lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, texcoord) +
                lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, texcoord) +
                lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, texcoord)
            );
			
			
			bloom.rgb = mapToAsymptote(bloom.rgb, 1.0, 1.0);
			bloom.rgb = increaseSaturation(bloom.rgb, 2.0); 
			
			
			scene *= 8.0;


			vec4 result = max(bloom, scene);
			if(result.a < 0.02) discard;
			gl_FragColor = result;	

        }
    `;

	// Shader compilation
	function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	function createProgram(
		gl: WebGL2RenderingContext,
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader
	) {
		const program = gl.createProgram()!;
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			throw new Error('Program link error');
		}
		return program;
	}

	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;

	const dimFragShader = createShader(gl, gl.FRAGMENT_SHADER, dimFragmentShaderSource)!;
	const compositeFragShader = createShader(gl, gl.FRAGMENT_SHADER, compositeFragShaderSource)!;

	const dimProgram = createProgram(gl, vertexShader, dimFragShader);
	const compositeProgram = createProgram(gl, vertexShader, compositeFragShader);

	const kernelSizeArray = [3, 5, 7, 9, 11];
	const blurPrograms: WebGLProgram[] = Array.from({ length: nMips }).map((_, i) => {
		const fragmentShaderSource = blurFragmentShaderSource(kernelSizeArray[i]);
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;
		return createProgram(gl, vertexShader, fragmentShader);
	});

	// Attribute and uniform locations
	const positionLocation = gl.getAttribLocation(blurPrograms[0], 'a_position');

	const texSizeLocations = blurPrograms.map((p) => gl.getUniformLocation(p, 'u_texSize'));
	const directionLocations = blurPrograms.map((p) => gl.getUniformLocation(p, 'u_direction'));

	const resolutionLocation = gl.getUniformLocation(compositeProgram, 'u_resolution');
	const bloomTextureLocations = [
		gl.getUniformLocation(compositeProgram, 'blurTexture1'),
		gl.getUniformLocation(compositeProgram, 'blurTexture2'),
		gl.getUniformLocation(compositeProgram, 'blurTexture3'),
		gl.getUniformLocation(compositeProgram, 'blurTexture4'),
		gl.getUniformLocation(compositeProgram, 'blurTexture5')
	];
	const bloomStrengthLocation = gl.getUniformLocation(compositeProgram, 'bloomStrength');
	const bloomRadiusLocation = gl.getUniformLocation(compositeProgram, 'bloomRadius');
	const bloomFactorsLocation = gl.getUniformLocation(compositeProgram, 'bloomFactors');
	const bloomTintColorsLocation = gl.getUniformLocation(compositeProgram, 'bloomTintColors');

	const sceneTextureLocation = gl.getUniformLocation(compositeProgram, 'sceneTexture');

	// Buffers
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
		gl.STATIC_DRAW
	);

	// Framebuffers and textures
	function createFramebufferTexture(gl: WebGL2RenderingContext, width: number, height: number) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

		return { framebuffer, texture, width, height };
	}

	type FramebufferTexture = ReturnType<typeof createFramebufferTexture>;
	const renderTargetsHorizontal: FramebufferTexture[] = [];
	const renderTargetsVertical: FramebufferTexture[] = [];
	let resx = Math.round(resolution.x / 2);
	let resy = Math.round(resolution.y / 2);

	for (let i = 0; i < nMips; i++) {
		renderTargetsHorizontal.push(createFramebufferTexture(gl, resx, resy));
		renderTargetsVertical.push(createFramebufferTexture(gl, resx, resy));
		resx = Math.max(1, Math.round(resx / 2));
		resy = Math.max(1, Math.round(resy / 2));
	}

	const sceneFBO = createFramebufferTexture(gl, resolution.x, resolution.y);

	// Function to draw a fullscreen quad
	function drawQuad(gl: WebGL2RenderingContext, program: WebGLProgram) {
		gl.useProgram(program);

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	// Function to render the scene
	function renderScene(renderFunction: () => any) {
		gl.enable(gl.BLEND);
		gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBO.framebuffer);

		gl.useProgram(dimProgram);
		gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
		drawQuad(gl, dimProgram);

		renderFunction();

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.disable(gl.BLEND);
	}

	// Function to apply blur
	function applyBlur(
		i: number,
		inputFBO: FramebufferTexture,
		outputFBO: FramebufferTexture,
		direction: [number, number]
	) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFBO.framebuffer);

		gl.useProgram(blurPrograms[i]);
		gl.bindTexture(gl.TEXTURE_2D, inputFBO.texture);

		gl.uniform2f(texSizeLocations[i], outputFBO.width, outputFBO.height);
		gl.uniform2f(directionLocations[i], ...direction);

		drawQuad(gl, blurPrograms[i]);
	}

	// Function to combine the bloom effects
	function combineBloomEffects() {
		gl.useProgram(compositeProgram);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sceneFBO.texture);
		gl.uniform1i(sceneTextureLocation, 0);

		// Bind all mip textures
		for (let i = 0; i < nMips; i++) {
			gl.activeTexture(gl[`TEXTURE${i + 1}` as keyof WebGL2RenderingContext] as GLenum);
			gl.bindTexture(gl.TEXTURE_2D, renderTargetsVertical[i].texture);
			gl.uniform1i(bloomTextureLocations[i], i + 1);
		}

		gl.uniform2f(resolutionLocation, resolution.x, resolution.y);
		gl.uniform1f(bloomStrengthLocation, strength);
		gl.uniform1f(bloomRadiusLocation, radius);
		gl.uniform1fv(bloomFactorsLocation, new Float32Array(bloomFactors.flat()));
		gl.uniform3fv(bloomTintColorsLocation, new Float32Array(bloomTintColors.flat()));

		drawQuad(gl, compositeProgram);
	}

	// Return the function to be called in the render loop
	return function (renderFunction: () => any) {
		// 1. Render the scene to a texture
		renderScene(renderFunction);

		let inputRenderTarget = sceneFBO;

		// 2. Apply blur progressively through the mip chain
		for (let i = 0; i < nMips; i++) {
			applyBlur(i, inputRenderTarget, renderTargetsHorizontal[i], [1.0, 0.0]); // Horizontal blur
			applyBlur(i, renderTargetsHorizontal[i], renderTargetsVertical[i], [0.0, 1.0]); // Vertical blur
			inputRenderTarget = renderTargetsVertical[i];
		}

		// 3. Combine the bloom effects
		combineBloomEffects();
	};
}
