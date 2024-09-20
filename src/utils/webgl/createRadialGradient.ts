export function createRadialGradientTexture(
	gl: WebGL2RenderingContext,
	size: number
): WebGLTexture | null {
	// Create an offscreen canvas to draw the gradient
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('Failed to create 2D context');
		return null;
	}

	const r = size / 2;
	// Create radial gradient
	const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);

	// Add color stops (white to transparent)
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Fully white at the center
	gradient.addColorStop(0.99, 'rgba(255, 255, 255, 0.0'); // Fully transparent at the edges

	// Fill the canvas with the gradient
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);

	// Create a WebGL texture and bind it
	const texture = gl.createTexture();
	if (!texture) {
		console.error('Failed to create texture');
		return null;
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Upload the canvas content as a texture
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// Unbind the texture
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
}
