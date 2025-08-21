class InteractiveCharacter {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.mousePosition = { x: 0, y: 0 };
        this.isLoaded = false;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.loadCharacter();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        this.camera.position.set(0, 1.7, 2.5);
        
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(400, 400);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(2, 3, 3);
        keyLight.castShadow = true;
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-3, 2, 1);
        this.scene.add(fillLight);
    }

    loadCharacter() {
        const loader = new THREE.GLTFLoader();
        loader.load(
            'https://models.readyplayer.me/68a6bc020eaecb799c55dee3.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.model.scale.set(1.2, 1.2, 1.2);
                
                this.model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });

                this.scene.add(this.model);
                this.centerModel();
                this.setupAnimations(gltf.animations);
                this.isLoaded = true;
            },
            undefined,
            (error) => {
                console.error('Character loading failed:', error);
                this.showFallback();
            }
        );
    }

    centerModel() {
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        this.model.position.x = -center.x;
        this.model.position.y = -box.min.y + 0.3;
        this.model.position.z = -center.z;
    }



    setupAnimations(animations) {
        if (animations && animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            animations.forEach((clip) => {
                this.animations[clip.name] = this.mixer.clipAction(clip);
            });
            
            // Play first available animation
            if (animations.length > 0) {
                const firstAnimation = this.mixer.clipAction(animations[0]);
                firstAnimation.play();
                this.currentAnimation = firstAnimation;
            }
        }
        console.log('Available animations:', Object.keys(this.animations));
    }

    playAnimation(name) {
        if (!this.animations[name]) {
            console.log(`Animation '${name}' not found`);
            return;
        }
        
        if (this.currentAnimation) {
            this.currentAnimation.fadeOut(0.5);
        }
        
        this.currentAnimation = this.animations[name];
        this.currentAnimation.reset().fadeIn(0.5).play();
    }

    setupEventListeners() {
        // Mouse tracking for character eye movement
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Scroll-based animations
        window.addEventListener('scroll', () => {
            this.handleScrollAnimation();
        });

        // Section-based character reactions
        this.observeSections();
    }

    handleScrollAnimation() {
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        
        if (this.model) {
            // Subtle head movement based on scroll
            this.model.rotation.y = Math.sin(scrollPercent * Math.PI * 2) * 0.1;
        }
    }

    observeSections() {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.reactToSection(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach((section) => observer.observe(section));
    }

    reactToSection(sectionId) {
        const reactions = {
            'home': 'wave',
            'about': 'thinking',
            'skills': 'excited',
            'projects': 'presenting',
            'contact': 'greeting'
        };

        const animation = reactions[sectionId] || 'idle';
        this.playAnimation(animation);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.mixer) {
            this.mixer.update(0.016);
        }

        if (this.model && this.isLoaded) {
            // Eye tracking effect
            const head = this.model.getObjectByName('Head');
            if (head) {
                head.lookAt(
                    this.mousePosition.x * 0.5,
                    this.mousePosition.y * 0.5 + 1.7,
                    2
                );
            }

            // Breathing animation
            const time = Date.now() * 0.001;
            this.model.scale.y = 1.2 + Math.sin(time * 2) * 0.02;
        }

        this.renderer.render(this.scene, this.camera);
    }

    showFallback() {
        this.container.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #f8f9fa, #e9ecef);border-radius:20px;font-weight:600;color:#495057;">
                <div style="text-align:center;">
                    <div style="font-size:3rem;margin-bottom:10px;">👋</div>
                    <div>Hi, I'm Nithin!</div>
                </div>
            </div>
        `;
    }

    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Initialize character when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rpm-character-container')) {
        window.interactiveCharacter = new InteractiveCharacter('rpm-character-container');
    }
});