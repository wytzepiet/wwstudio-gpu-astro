export async function loadShader(gl: WebGL2RenderingContext, url: string, type: number) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to load shader: ${res.statusText}`);
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, await res.text());
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Shader compile error:', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		throw new Error('Shader compile error');
	}
	return shader;
}

export async function initProgram(
	gl: WebGL2RenderingContext,
	{
		vertexPath,
		fragmentPath,
		transformFeedbackVaryings
	}: {
		vertexPath: string;
		fragmentPath: string;
		transformFeedbackVaryings?: string[];
	}
) {
	const program = gl.createProgram()!;
	gl.attachShader(program, await loadShader(gl, vertexPath, gl.VERTEX_SHADER));
	gl.attachShader(program, await loadShader(gl, fragmentPath, gl.FRAGMENT_SHADER));

	if (transformFeedbackVaryings) {
		gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
	}

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Program link error:', gl.getProgramInfoLog(program));
		throw new Error('Program link error');
	}

	return program;
}

type TexOptions = {
	target: GLenum;
	level: GLint;
	internalformat: GLint;
	border: GLint;
	format: GLenum;
	type: GLenum;
	srcData: ArrayBufferView | null;
};

export function create3DTexture(
	gl: WebGL2RenderingContext,
	dimensions: number[],
	options: Partial<TexOptions> = {}
) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_3D, texture);

	gl.texImage3D(
		options.target ?? gl.TEXTURE_3D, // Target
		options.level ?? 0, // Level of detail
		options.internalformat ?? gl.RGBA32F, // Internal format (32-bit float RGBA)
		dimensions[0], // Width
		dimensions[1], // Height
		dimensions[2], // Depth
		options.border ?? 0, // Border, must be 0
		options.format ?? gl.RGBA, // Format
		options.type ?? gl.FLOAT, // Type
		options.srcData ?? null // Data (null to allocate but not initialize)
	);

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.bindTexture(gl.TEXTURE_3D, null);
	return texture;
}

export const createBuffer = (gl: WebGL2RenderingContext, data: AllowSharedBufferSource) => {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_COPY);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return buffer;
};
