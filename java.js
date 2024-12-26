const cardsContainer = document.getElementById('cardsContainer');

const data = [
    {
        img: 'https://atlas-content-cdn.pixelsquid.com/stock-images/christmas-ornament-decoration-3yLWaqD-600.jpg',
        name: 'Christmas Cup',
        price: 120, 
    },
    {
        img:'https://p.turbosquid.com/ts-thumb/tU/wWdIEh/Hd/rolledredclassicplaidscarfvray3dmodel001/jpg/1692245993/600x600/fit_q87/e6cac7a79ae87423108b953b5b6e25743230431e/rolledredclassicplaidscarfvray3dmodel001.jpg',
        name: 'Scarf',
        price: 120, 
    },
    {
        img: 'https://example.com/christmas-tree.jpg',
        name: 'Christmas tree',
        price: 120, 
    },
    {
        img: 'https://example.com/pyjama.jpg',
        name: 'Pyjama',
        price: 120, 
    },
    {
        img: 'https://example.com/hat.jpg',
        name: 'hat',
        price: 120, 
    },
];





const TOTAL_NUM_FLAKES = 300;
const LAYERS = [
    { layer: 1, sizeMin: 24, sizeMax: 40, speedFactor: 0.12, swayAmpMin: 10, swayAmpMax: 30, opacity: 1, blur: 0, colorVariationMin: 255, colorVariationMax: 255, symbols: ["•"], zIndex: 6 },
    { layer: 2, sizeMin: 20, sizeMax: 28, speedFactor: 0.09, swayAmpMin: 10, swayAmpMax: 25, opacity: 0.85, blur: 2, colorVariationMin: 255, colorVariationMax: 255, symbols: ["•"], zIndex: 5 },
    { layer: 3, sizeMin: 16, sizeMax: 24, speedFactor: 0.07, swayAmpMin: 10, swayAmpMax: 20, opacity: 0.75, blur: 4, colorVariationMin: 255, colorVariationMax: 255, symbols: ["•"], zIndex: 4 },
    { layer: 4, sizeMin: 12, sizeMax: 18, speedFactor: 0.05, swayAmpMin: 10, swayAmpMax: 20, opacity: 0.65, blur: 5, colorVariationMin: 220, colorVariationMax: 229, symbols: ["•"], zIndex: 3 },
    { layer: 5, sizeMin: 10, sizeMax: 14, speedFactor: 0.03, swayAmpMin: 10, swayAmpMax: 20, opacity: 0.55, blur: 7, colorVariationMin: 210, colorVariationMax: 219, symbols: ["•"], zIndex: 2 },
    { layer: 6, sizeMin: 8, sizeMax: 12, speedFactor: 0.01, swayAmpMin: 10, swayAmpMax: 20, opacity: 0.4, blur: 30, colorVariationMin: 200, colorVariationMax: 209, symbols: ["•"], zIndex: 1 }
];

class SnowLayer {
    constructor(canvasId, layerProps) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.layerProps = layerProps;
        this.resize();
        this.snowflakes = [];
        this.initializeSnowPiles();
        this.createSnowflakes(Math.floor(TOTAL_NUM_FLAKES / LAYERS.length));
    }

    initializeSnowPiles() {
        this.snowPileHeights = Array.from({ length: this.NUM_SEGMENTS }, (_, j) => {
            if (j === 0) return this.height - 30 + (Math.random() * 10 - 5);
            const prevHeight = this.snowPileHeights[j - 1];
            let newHeight = prevHeight + (Math.random() * 10 - 5);
            return Math.max(this.height - 100, Math.min(this.height - 10, newHeight));
        });
        this.smoothSnowPile(2);
    }

    smoothSnowPile(iterations = 1) {
        for (let iter = 0; iter < iterations; iter++) {
            const temp = [...this.snowPileHeights];
            for (let i = 1; i < this.NUM_SEGMENTS - 1; i++) {
                temp[i] = (this.snowPileHeights[i - 1] + this.snowPileHeights[i] + this.snowPileHeights[i + 1]) / 3;
            }
            this.snowPileHeights = temp;
        }
    }

    createSnowflakes(numFlakes) {
        for (let i = 0; i < numFlakes; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }

    createSnowflake() {
        const { symbols, sizeMin, sizeMax, speedFactor, swayAmpMin, swayAmpMax, opacity, blur, colorVariationMin, colorVariationMax } = this.layerProps;
        const size = Math.random() * (sizeMax - sizeMin) + sizeMin;
        const fallSpeed = size * speedFactor + Math.random() * 0.5;
        const swayAmplitude = Math.random() * (swayAmpMax - swayAmpMin) + swayAmpMin;
        const swaySpeed = Math.random() * 0.02 + 0.01;
        const rotation = Math.random() * Math.PI * 2;
        const rotationSpeed = Math.random() * 0.02 - 0.01;
        const colorVariation = Math.floor(Math.random() * (colorVariationMax - colorVariationMin + 1)) + colorVariationMin;
        const color = `rgba(${colorVariation}, ${colorVariation}, ${colorVariation}, ${opacity})`;

        return {
            x: Math.random() * this.width,
            y: Math.random() * -this.height,
            size, symbol: symbols[Math.floor(Math.random() * symbols.length)],
            fallSpeed, swayAmplitude, swaySpeed, swayOffset: Math.random() * Math.PI * 2,
            opacity, blur, color, rotation, rotationSpeed
        };
    }

    drawSnowPile() {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.snowPileHeights[0]);
        for (let i = 1; i < this.NUM_SEGMENTS; i++) {
            this.ctx.lineTo(i * this.SEGMENT_WIDTH, this.snowPileHeights[i]);
        }
        this.ctx.lineTo(this.width, this.snowPileHeights[this.NUM_SEGMENTS - 1]);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.layerProps.opacity})`;
        this.ctx.fill();
    }

    getSnowPileHeight(x) {
        const index = Math.floor(x / this.SEGMENT_WIDTH);
        return index < 0 || index >= this.NUM_SEGMENTS ? this.height : this.snowPileHeights[index];
    }

    addToSnowPile(x, size) {
        const index = Math.floor(x / this.SEGMENT_WIDTH);
        if (index < 0 || index >= this.NUM_SEGMENTS) return;
        this.snowPileHeights[index] -= size * 0.5;
        for (let i = 1; i <= 2; i++) {
            if (index - i >= 0) this.snowPileHeights[index - i] -= size * 0.05;
            if (index + i < this.NUM_SEGMENTS) this.snowPileHeights[index + i] -= size * 0.05;
        }
        for (let i = -2; i <= 2; i++) {
            const currentIndex = index + i;
            if (currentIndex >= 0 && currentIndex < this.NUM_SEGMENTS && this.snowPileHeights[currentIndex] < this.height - 100) {
                this.snowPileHeights[currentIndex] = this.height - 100;
            }
        }
        this.smoothSnowPile(1);
    }

    animate(wind) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawSnowPile();
        for (let flake of this.snowflakes) {
            const swayX = Math.sin(flake.swayOffset) * flake.swayAmplitude;
            const windEffect = wind.speed * wind.direction;
            flake.rotation += flake.rotationSpeed;
            this.ctx.save();
            this.ctx.translate(flake.x + swayX + windEffect, flake.y);
            this.ctx.rotate(flake.rotation);
            this.ctx.font = `${flake.size}px sans-serif`;
            this.ctx.fillStyle = flake.color;
            this.ctx.shadowBlur = flake.blur;
            this.ctx.shadowColor = flake.color;
            this.ctx.fillText(flake.symbol, 0, 0);
            this.ctx.restore();
            flake.y += flake.fallSpeed;
            flake.x += windEffect * 0.5;
            flake.swayOffset += flake.swaySpeed;
            if (flake.y >= this.getSnowPileHeight(flake.x + swayX + windEffect) - flake.size / 2) {
                this.addToSnowPile(flake.x + swayX + windEffect, flake.size);
                Object.assign(flake, this.createSnowflake());
                flake.y = Math.random() * -this.height;
                flake.x = Math.random() * this.width;
                flake.swayOffset = Math.random() * Math.PI * 2;
            }
            if (flake.x > this.width + 50) flake.x = -50;
            else if (flake.x < -50) flake.x = this.width + 50;
            if (flake.y > this.height + 50) {
                flake.y = Math.random() * -this.height;
                flake.x = Math.random() * this.width;
                flake.swayOffset = Math.random() * Math.PI * 2;
            }
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.NUM_SEGMENTS = Math.ceil(this.width / this.SEGMENT_WIDTH);
        this.initializeSnowPiles();
        this.snowflakes = [];
        this.createSnowflakes(Math.floor(TOTAL_NUM_FLAKES / LAYERS.length));
    }
}

let wind = { direction: Math.random() < 0.5 ? -1 : 1, speed: Math.random() * 0.5 + 0.1 };
setInterval(() => { wind.direction = Math.random() < 0.5 ? -1 : 1; wind.speed = Math.random() * 0.5 + 0.1; }, 5000);

const snowLayers = LAYERS.map(layer => new SnowLayer(`snow-canvas-${layer.layer}`, layer));
window.addEventListener("resize", () => snowLayers.forEach(layer => layer.resize()));
function animate() { snowLayers.forEach(layer => layer.animate(wind)); requestAnimationFrame(animate); }
animate();



const NUMBER_OF_SNOWFLAKES = 300;
const MAX_SNOWFLAKE_SIZE = 5;
const MAX_SNOWFLAKE_SPEED = 2;
const SNOWFLAKE_COLOUR = '#ddd';
const snowflakes = [];

const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.pointerEvents = 'none';
canvas.style.top = '0px';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');


const createSnowflake = () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
    color: SNOWFLAKE_COLOUR,
    speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
    sway: Math.random() - 0.5 // next
});

const drawSnowflake = snowflake => {
    ctx.beginPath();
    ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
    ctx.fillStyle = snowflake.color;
    ctx.fill();
    ctx.closePath();
}

const updateSnowflake = snowflake => {
    snowflake.y += snowflake.speed;
    snowflake.x += snowflake.sway; // next
    if (snowflake.y > canvas.height) {
        Object.assign(snowflake, createSnowflake());
    }
}



data.forEach((item) => {
    const card = document.createElement('div');
    const cardImage = document.createElement('img');
    const cardName = document.createElement('p');
    const cardPrice = document.createElement('span');


    cardName.textContent = item.name;
    cardImage.src = item.image;
    cardPrice.textContent = item.price + ' $';


    card.classList.add('card');
    card.appendChild(cardImage);
    card.appendChild(cardName);
    card.appendChild(cardPrice);
    
    cardsContainer.appendChild(card);
});



window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    header.classList.toggle("sticky", window.scrollY > 200);
});


document.addEventListener('DOMContentLoaded', function() {
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 1;

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % dots.length;
        updateDots();
    }, 3000);
});


const arrow = document.getElementById('up');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        arrow.style.display = '';
    } else {
        arrow.style.display = 'none';
    }
});


const countdown = () => {
    const now = new Date();
    const nextYear = new Date(`January 1, ${now.getFullYear() + 1} 00:00:00`);
    const diff = nextYear - now;

    const days = Math.floor(diff / (1000 / 60 / 60 / 24));
    const hours = Math.floor((diff / (1000 /60 / 60)) % 24);
    const minutes = Math.floor((diff / (1000 /60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').textContent = days < 10 ? '0' + days : days;
    document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
};
