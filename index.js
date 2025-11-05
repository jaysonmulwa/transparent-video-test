document.addEventListener('DOMContentLoaded', () => {

    // --- 3. PNG Sequence Implementation ---
    const imgElement = document.getElementById('png-sequence');
    // NOTE: Update these values based on your asset naming and desired frame rate.
    const totalFrames = 60; 
    let currentFrame = 1;
    const frameRate = 1000 / 30; // 30 frames per second (33.33ms delay)

    if (imgElement) {
        function updateFrame() {
            // Formats the frame number to have four leading zeros (e.g., 0001)
            const frameNumber = String(currentFrame).padStart(3, '0');
            // Assumes your PNGs are in a subfolder named 'png_sequence'
            imgElement.src = `png_sequence/unscreen-${frameNumber}.png`;

            currentFrame++;
            if (currentFrame > totalFrames) {
                currentFrame = 1; // Loop the sequence
            }
        }
        // Start the PNG Sequence animation loop
        setInterval(updateFrame, frameRate);
    }
    // ----------------------------------------


    // --- 4. MP4 Overlay Implementation ---
    const canvas = document.getElementById('mp4-overlay-canvas');
    const colorVideo = document.getElementById('color-video');
    const matteVideo = document.getElementById('matte-video');

    if (canvas && colorVideo && matteVideo) {
        const ctx = canvas.getContext('2d');
        const videoWidth = canvas.width;
        const videoHeight = canvas.height;
        
        let videosLoaded = 0;
        const totalVideos = 2;

        function videoLoadHandler() {
            videosLoaded++;
            if (videosLoaded === totalVideos) {
                // Ensure videos try to play after loading data
                // Play() returns a Promise which must be handled for auto-play restrictions
                colorVideo.play().catch(e => console.warn("Color video auto-play failed:", e));
                matteVideo.play().catch(e => console.warn("Matte video auto-play failed:", e));
                
                // Start the canvas drawing loop only after videos are ready
                requestAnimationFrame(drawVideo);
            }
        }

        colorVideo.addEventListener('loadeddata', videoLoadHandler);
        matteVideo.addEventListener('loadeddata', videoLoadHandler);

        // Fallback play attempt for immediate start (may fail depending on browser policy)
        colorVideo.play().catch(() => {}); 
        matteVideo.play().catch(() => {});

        function drawVideo() {
            // Only draw if both videos are playing and ready
            if (colorVideo.readyState >= 2 && matteVideo.readyState >= 2) {
                
                // 1. Draw the full color video (this is the DESTINATION)
                ctx.drawImage(colorVideo, 0, 0, videoWidth, videoHeight);

                //ctx.globalCompositeOperation = 'screen'; //overlay // screen //lighten // soft-light
                ctx.globalAlpha = 0.7; // less of the color video passes through

                // 2. Set the composite operation for masking
                // 'destination-in' means: Keep the parts of the destination (color video) 
                // that overlap with the non-transparent parts of the source (matte video).
                ctx.globalCompositeOperation = 'destination-in';
                
                // 3. Draw the matte video (this is the SOURCE)
                // White areas in the matte video will keep the color video visible.
                ctx.drawImage(matteVideo, 0, 0, videoWidth, videoHeight);

                // 4. Reset the composite operation for the next frame
                ctx.globalCompositeOperation = 'source-over'; 
            }

            // Loop the drawing function using the browser's optimized rendering loop
            requestAnimationFrame(drawVideo);
        }
    }
    // ----------------------------------------
});