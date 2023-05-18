window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;

    const G = 0.981;

    let keysDict = [
        'w',
        'a',
        's',
        'd',
    ];
    

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
                }
                console.log(this.keys);
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

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;     

            
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
            this.frame = {
                width: this.img.width/25,
                height: this.img.height/this.img.states.length,
                current: 0,
                state: 'idle',
                flapinterval: 100,
                timer: 0,
            }
            
            this.image = playerImage;

            // FIRST ANIMATION
            this.hitbox = {
                width: 25,
                height: 35,
            }

            // GAME CONFIG
            this.gCfg = {
                groundLevel: 20,                
            }
            
            this.gCfg.lowerY = this.gameHeight - this.gCfg.groundLevel - this.hitbox.height

            //problem with the sprite COMPENSATE
            this.frame.bound = {
                x: 11 - this.frame.width/2,
                y: this.hitbox.height+7 - this.frame.height,
            }
            
            // x0 and y0
            this.x = 0;
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


            
            
            
            
        }
        #changeFrame(dt){
            if (this.frame.timer > this.frame.flapinterval) {
                this.frame.current++;
                // this.frame.current = this.frame.current % this.img.states[
                //     this.frame.state
                // ].n;
                let currentstate_n = this.img.states.filter(
                    e => e.name === this.frame.state
                )[0].n;
                    
                this.frame.current = this.frame.current % currentstate_n;
                console.log(this.frame.current);
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
        update(dt){
            this.#changeFrame(dt);
            
            this.update_x(dt, this.v.x*dt);
            this.update_y(dt, this.v.y*dt);

            if (input.keys.indexOf('d') > -1) {
                // move right
                this.v.x = this.v.m;
            } else if (input.keys.indexOf('a') > -1) {
                // move left
                this.v.x = -this.v.m;
            } else {
                this.v.x = 0;                
            }

            if (input.keys.indexOf('w') > -1 && this.jump.on) {
                // jump
                this.v.y = -this.v.m*G*3;
                
            } else {
                // fall
                this.v.y += G/dt/5;
            }
            
            if (input.keys.indexOf('s') > -1) {
                // crouch
                
            } 
            /*
            else {
                this.v.x = 0;
                this.v.y = G/dt;
            }
            */

            
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

    }

    class Background {

    }

    class Enemy {

    }

    function handleEnemies() {

    }

    function displayStatusText() {

    }

    //#region prepare for animate
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);

    let lastTime = 0;
    //#endregion
    function animate(timestamp) {
        ctx.clearRect(0,0,canvas.width, canvas.height);

        dt = timestamp - lastTime;
        lastTime = timestamp;

        player.update(dt);
        player.draw(ctx);
        
        requestAnimationFrame(animate);
    }
    animate(0);
});