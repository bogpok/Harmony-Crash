/** @type {HTMLCanvasElement} */
window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;

    const G = 0.981;
    const HEALTH_POINTS = 3;

    let keysDict = [
        'w',
        'a',
        's',
        'd',
        ' ',
        
    ];

    let score = 0;
    

    class InputHandler {
        constructor() {
            // keep track of multiple keys presses
            this.keys = [];
            
            // with every instance event listener created
            // using arrow fucntion inherits parent scope (lexical scoping)
            window.addEventListener('keydown', e => {
                // when any button is pressed
                console.log(e);
                // element is not present in the array
                if (keysDict.includes(e.key) && this.keys.indexOf(e.key) === -1 ) {
                    this.keys.push(e.key);
                } else if (e.key==='Enter' && gameOver) {
                    restartGame();
                }
                
            });

            window.addEventListener('keyup', e => {
                if (keysDict.includes(e.key)) {
                    // remove one element from array
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
                console.log(this.keys);
            });
        }

    }

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameHeight = gameHeight;
            this.gameWidth = gameWidth;

            this.image = backgroundImage;
            this.x = 0;
            this.y = 0;

            this.img = {
                height: 398,
                width: 928,                 
            }
            this.img.scale = canvas.height/this.img.height

            this.width = this.img.scale * this.img.width;

            this.speed = 10;

        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.img.scale * this.img.height, )

            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.img.scale * this.img.height, )
        }
        update(dt){
            this.x -= this.speed;
            if (this.x < -this.width) this.x = 0;
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;     
            this.image = playerImage;
            this.img = {
                height: 1792,
                width: 7200,
                states: [
                    {name:'idle', n: 6},
                    {name:'run', n: 8},
                    {name:'j_up', n: 3},
                    {name:'j_down', n: 3},
                    {name:'atk_leg', n: 7},
                    {name:'atk1', n: 6},
                    {name:'atk2', n: 12},
                    {name:'atk3', n: 23},
                    {name:'atk_sp', n: 25},
                    {name:'meditate', n: 16},
                    {name:'roll', n: 6},
                    {name:'guard', n: 13},
                    {name:'takehit', n: 6},
                    {name:'faint', n: 14},                    
                ]
            }
            this.img.max = Math.max(...this.img.states.map(e=>e.n))
            this.frame = {
                width: this.img.width/this.img.max,
                height: this.img.height/this.img.states.length,
                current: 0,
                state: 'idle',
                flapinterval: 100,
                timer: 0,
            }           
            
            this.hitbox = {
                width: 25,
                height: 35,
            }

            // GAME CONFIG
            this.gCfg = {
                groundLevel: 30,                
            }
            
            this.gCfg.lowerY = this.gameHeight - this.gCfg.groundLevel - this.hitbox.height

            //problem with the sprite COMPENSATE
            this.frame.bound = {
                x: 11 - this.frame.width/2,
                y: this.hitbox.height+7 - this.frame.height,
            }

            this.v = {
                x: 0,
                y: 0,
                m: 0.3,
            }

            this.jump = {
                max: this.hitbox.height*3,
                on: true,                
            }
            
            // x0 and y0
            this.x = 0;
            this.y = this.gameHeight - this.gCfg.groundLevel - this.hitbox.height;           

            this.position = {
                x: this.x + this.frame.bound.x,
                y: this.y + this.frame.bound.y,
            }            
            
            this.center = {
                x: this.hitbox.width / 2 + this.x,
                y: this.hitbox.height / 2 + this.y,
            }

            this.takehit = {
                timer: 0,
                interval: 300,
                on: false
            }           
                    
            
        }

        reset(){
            this.frame = {
                current: 0,
                state: 'idle',                
                timer: 0,
            }

            // x0 and y0
            this.x = 0;
            this.y = this.gameHeight - this.gCfg.groundLevel - this.hitbox.height;           
            console.log(this)

            this.position = {
                x: this.x + this.frame.bound.x,
                y: this.y + this.frame.bound.y,
            }            
            
            this.center = {
                x: this.hitbox.width / 2 + this.x,
                y: this.hitbox.height / 2 + this.y,
            }

            this.takehit = {
                timer: 0,                
                on: false
            }    

        }
        #changeState(state = 'idle'){
            this.frame.state = state;

            let currentstate_n = this.img.states.filter(
                e => e.name === this.frame.state
            )[0].n;
            if (state != 'idle'){
                console.log(state, currentstate_n)
                console.log(this.frame.current)
            }
            else if (false) {
                if (this.frame.current > currentstate_n) this.frame.current = 0;
            }
            

            
            
        }
        changeFrame(dt){
            if (this.frame.timer > this.frame.flapinterval) {
                this.frame.current++;
                // this.frame.current = this.frame.current % this.img.states[
                //     this.frame.state
                // ].n;
                let currentstate_n = this.img.states.filter(
                    e => e.name === this.frame.state
                )[0].n;
                    
                this.frame.current = this.frame.current % currentstate_n;
                
                this.frame.timer = 0;
            } else {
                this.frame.timer += dt;
            }
        }
        update_x(dt, dx = 0, reset = false){
            // horizontal movement            
            if (reset) {
                this.x = dx;
                this.position.x = this.x + this.frame.bound.x;
            } else {
                this.x += dx;
                this.position.x += dx;
            }        
        }
        update_y(dt, dy = 0, reset = false){
            if (reset) {
                this.y = dy;
                this.position.y = this.y + this.frame.bound.y;
            } else {
                this.y += dy;
                this.position.y += dy;
            }   
        }
        update(dt, enemies){
            this.changeFrame(dt);
            
            this.update_x(dt, this.v.x*dt);
            this.update_y(dt, this.v.y*dt);
            this.center = {
                x: this.hitbox.width / 2 + this.x,
                y: this.hitbox.height / 2 + this.y,
            }

            if (input.keys.length == 0 && !this.takehit.on) {
                this.v.x = 0;
                this.#changeState('idle');                                
            }

            if (input.keys.indexOf('d') > -1 ) {
                // move right
                this.v.x = this.v.m;
                this.#changeState('run')
            } else if (input.keys.indexOf('a') > -1 ) {
                // move left
                this.v.x = -this.v.m;
                this.#changeState('run')
            } 

            if (input.keys.indexOf('w') > -1 && this.jump.on ) {
                // jump
                this.v.y = -this.v.m*G*3;
                this.#changeState('j_up')                
                
            } else {
                // fall
                this.v.y += G/dt/5;
                if (!this.jump.on) this.#changeState('j_down');
            }
            
            if (input.keys.indexOf('s') > -1 && !this.takehit.on) {
                // meditate
                this.#changeState('meditate')
                                
            } 

            if (input.keys.indexOf(' ') > -1 && !this.takehit.on) {
                this.frame.oldflap = this.frame.flapinterval
                this.frame.flapinterval = 50;
                this.#changeState('atk2');
            }
            
            
            //#region boundaries

            // Ox
            if (this.x < 0) this.update_x(dt, 0, true);
            else if (this.x > this.gameWidth - this.hitbox.width) this.update_x(dt, this.gameWidth - this.hitbox.width, true);

            // Oy         
            if (this.y < this.gCfg.lowerY - this.jump.max) {
                this.jump.on = false;
                this.update_y(dt, this.gCfg.lowerY - this.jump.max, true);
                this.v.y = 0;
            } else if (this.y > this.gCfg.lowerY) {
                // GROUND
                this.update_y(dt, this.gCfg.lowerY, true);
                this.jump.on = true;
            } 
            

            //#endregion

            if (!this.takehit.on) this.detectCollision(dt, enemies);
            else {
                if (this.takehit.timer > this.takehit.interval) {
                    this.takehit.on = false;
                    this.takehit.timer = 0;
                } else {
                    this.takehit.timer += dt;
                }
            }
            console.log(this.takehit.timer)
            
            
        }

        draw(context){
            // hitbox area
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, this.hitbox.width, this.hitbox.height);

            // whole slide from spritesheet
            context.strokeStyle = 'red';
            context.strokeRect(this.position.x, this.position.y, this.frame.width, this.frame.height)
            
            
            let state_n = this.img.states.findIndex((e) => e.name === this.frame.state);

            context.drawImage(this.image, 
                this.frame.current*this.frame.width, state_n*this.frame.height, this.frame.width, this.frame.height,
                this.position.x, this.position.y, this.frame.width, this.frame.height);
        }

        detectCollision(dt, enemies){

            let rect1 = {
                x: this.x,
                y: this.y,
                width: this.hitbox.width,
                height: this.hitbox.height,                
            }
            if (this.frame.state.startsWith('atk')) {
                rect1.width+=7;                
            }

            enemies.forEach(enemy => {
                let rect2 = {
                    x: enemy.x,
                    y: enemy.y,
                    width: enemy.hitbox.width,
                    height: enemy.hitbox.height, 
                }
                
                if (collideRect(rect1, rect2)) {
                    
                    if (this.frame.state.startsWith('atk')) {
                        enemy.deleteMarker = true;
                        score++;
                    } else {
                        this.#gotHit(dt);
                    }


                }

            })          

        }
        #gotHit(dt){
            hp--;

            if (hp < 0) gameOver = true;

            this.update_x(dt, -10);            
            this.#changeState('takehit');
            this.takehit.on = true;
        }

    }

    collideRect = (rect1, rect2) => {
        if (rect1.x > rect2.x + rect2.width ||
            rect1.x + rect1.width < rect2.x ||
            rect1.y > rect2.y + rect2.height ||
            rect1.y + rect1.height < rect2.y )
            {
                return false;
            }
        else {             
            return true;
        }
    }

    class Enemy extends Player {
        constructor(gameWidth, gameHeight){
            super()
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;     

            this.image = hound;
            this.img = {
                height: 32,
                width: 335,
                states: [
                    {name:'run', n: 5},
                                       
                ]
            }            
            this.img.max = Math.max(...this.img.states.map(e=>e.n))         
            
            this.frame = {
                width: this.img.width/this.img.max,
                height: this.img.height/this.img.states.length,
                current: 0,
                state: 'run',
                flapinterval: 50,
                timer: 0,
            }
            
            

            // FIRST ANIMATION
            this.hitbox = {
                width: this.frame.width-16,
                height: this.frame.height-5,
            }

            this.frame.bound = {
                x: -8,
                y: -5,
            }

            // GAME CONFIG
            this.gCfg = {
                groundLevel: 30,                
            }
            
            this.gCfg.lowerY = this.gameHeight - this.gCfg.groundLevel - this.hitbox.height

            
            
            
            
            
            // x0 and y0
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.gCfg.groundLevel - this.hitbox.height;           

            
            this.position = {
                x: this.x + this.frame.bound.x,
                y: this.y + this.frame.bound.y,
            }
            
            this.v = {
                x: 0,
                y: 0,
                m: 0.3,
            }

            this.jump = {
                max: this.hitbox.height*2,
                on: true,                
            }

            this.deleteMarker = false;
            
        }

        draw(context){
            // hitbox area
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, this.hitbox.width, this.hitbox.height);

            // whole slide from spritesheet
            context.strokeStyle = 'red';
            context.strokeRect(this.position.x, this.position.y, this.frame.width, this.frame.height)
            
            
            let state_n = this.img.states.findIndex((e) => e.name === this.frame.state);

            context.drawImage(this.image, 
                this.frame.current*this.frame.width, state_n*this.frame.height, this.frame.width, this.frame.height,
                this.position.x, this.position.y, this.frame.width, this.frame.height);
        }
        update(dt){
            this.changeFrame(dt);
            this.v.x = Math.random()*2 + 1;
            this.update_x(dt, -this.v.x);

            if (this.x < -this.hitbox.width) this.deleteMarker = true; 
        }
        


    }

    let enemies = [];
    let enemyConfig = {
        timer:  0,
        interval: 1000,
    }
    

    function handleEnemies(dt) {

        if (enemyConfig.timer > enemyConfig.interval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyConfig.timer = 0;
        } else {
            enemyConfig.timer += dt;
        }
        

        enemies.forEach(enemy => {
            // enemy.update_x(dt, 100, true);
            // enemy.image.flapinterval = 500
            enemy.update(dt);
            enemy.draw(ctx);
        })
        
        enemies = enemies.filter(e => !e.deleteMarker);
        
    }

    function displayStatusText(context) {
        context.fillStyle = 'white';
        context.font = String(15) + 'px Helvetica';
        context.fillText('Score: ' + score, 10, 20);
    }

    function displayHp(context) {
        let _text = 'HP: ' + hp
        context.fillStyle = 'crimsone';
        context.font = String(15) + 'px Helvetica';
        context.fillText(_text, 10, canvas.height-10);

        context.fillStyle = 'red';
        context.fillText(_text, 11, canvas.height-9);

    }

    function restartGame(){
        player=new Player(canvas.width, canvas.height);

        enemies = [];
        score = 0;
        hp = HEALTH_POINTS;

        gameOver = false;

        animate()

    }

    function gameOverScreen(context){
        context.fillStyle = 'grey';
        context.fillRect(0,0,canvas.width,canvas.height)
        context.textAlign = 'center';
        context.fillStyle = 'black';
        context.fillText('Game Over',canvas.width/2, canvas.height/2)
    }

    //#region prepare for animate
    const bg = new Background;
    const input = new InputHandler();
    let player = new Player(canvas.width, canvas.height);
    let hp = HEALTH_POINTS;
    let gameOver = false;
    

    let lastTime = 0;
    //#endregion
    function animate(timestamp) {
        ctx.clearRect(0,0,canvas.width, canvas.height);

        dt = timestamp - lastTime;
        lastTime = timestamp;

        bg.draw(ctx);
        //bg.update(dt);

        
        handleEnemies(dt);

        player.update(dt, enemies);
        player.draw(ctx);
        
        
        displayStatusText(ctx);
        displayHp(ctx);

        if (!gameOver) requestAnimationFrame(animate);
        else gameOverScreen(ctx);
    }
    animate(0);
});