class ScrollImageSequence {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.loading = document.getElementById('loading');
        this.images = [];
        this.currentFrame = 0;
        this.frameCount = 40;
        this.imagesLoaded = false;
        
        this.init();
    }

    async init() {
        await this.loadImages();
        this.setupCanvas();
        this.setupScrollListener();
        this.setupIntersectionObserver();
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    async loadImages() {
        const promises = [];
        
        for (let i = 1; i <= this.frameCount; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, '0');
            img.src = `images/ezgif-frame-${paddedIndex}.jpg`;
            
            promises.push(new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            }));
            
            this.images.push(img);
        }
        
        await Promise.all(promises);
        this.imagesLoaded = true;
        this.loading.style.display = 'none';
        this.render();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupScrollListener() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateFrame();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateFrame() {
        if (!this.imagesLoaded) return;
        
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = Math.min(scrollTop / docHeight, 1);
        
        const frameIndex = Math.min(
            Math.floor(scrollProgress * (this.images.length - 1)),
            this.images.length - 1
        );
        
        if (frameIndex !== this.currentFrame) {
            this.currentFrame = frameIndex;
            this.render();
        }
    }

    render() {
        if (!this.imagesLoaded || !this.images[this.currentFrame]) return;
        
        const img = this.images[this.currentFrame];
        
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const hRatio = this.canvas.width / img.width;
        const vRatio = this.canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        
        const centerX = (this.canvas.width - img.width * ratio) / 2;
        const centerY = (this.canvas.height - img.height * ratio) / 2;
        
        this.ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            centerX, centerY, img.width * ratio, img.height * ratio
        );
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.render();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-10%'
        });

        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollImageSequence();
});