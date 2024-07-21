window.addEventListener('load', function(){
    //canvas setup
    const canvas= document.getElementById('canvas1')
    const ctx = canvas.getContext('2d') //A built in object that contains all methods and properties that allow us to draw and animate colours, shapes etc on HTML canvas 
    
    canvas.width = 500;
    canvas.height = 500;

    // Keep track of user input
    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e=> {
                if(( (e.key === 'ArrowUp') ||
                     (e.key === 'ArrowDown')
                      
                ) && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key); 
                } else if(e.key === ' '){
                    this.game.player.shootTop();
                }
                //console.log(this.game.keys);

            });
            window.addEventListener('keyup', e=>{
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1); 
                }
                //console.log(this.game.keys);

            });
        }

    }

    //Hamdle player laser
    class Projectile{
        constructor(game,x,y){
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 3;
        this.speed = 3;
        this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if(this.x> this.game.width * 0.8) this.markedForDeletion = true //delete prjectile at 80% from the player

        }
        draw(context){
          context.fillStyle = 'yellow';
          context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Particles from damaged enemies
    class Particle{
        
    }

    //control main character
    class Player{
       constructor(game){
         this.game = game
         this.width = 120;
         this.height = 190;
         this.x = 20;
         this.y = 100;
         this.speedY = 0.7;
         this.maxSpeed = 2;
         this.projectiles =[];
       } 
       update(){
        if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
        else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed ;
        else this.speedY = 0;
          this.y += this.speedY
          //handle projectiles
          this.projectiles.forEach(projectile =>{
            projectile.update();
          } );
          //filter and delete projectiles which are far away
          this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
       }
       draw(context){
        context.fillStyle = 'black'
         context.fillRect(this.x, this.y, this.width, this.height)
         this.projectiles.forEach(projectile =>{
            projectile.draw(context);
          } );
        }

       shootTop(){
        if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game, this.x+80, this.y+30))  
            console.log(this.projectiles);
            this.game.ammo--;
        }
       
        }
    }

    //Handle all enemy types 
    class Enemy{
        constructor(game){
            this.game =game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
        }
        
        update(){
            this.x += this.speedX;
            if(this.x + this.width <0) this.markedForDeletion = true;
        }

        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.font = '20px Helvetica';
            
            context.fillText(this.lives, this.x, this.y);
        }
    }

//Enemy type1
 class Angler1 extends Enemy{
    constructor(game){
        super(game);
        this.width = 228 * 0.2;
        this.height = 169 * 0.2;
        this.y = Math.random() * (this.game.height*0.9 - this.height);
    }
 }


    //Handle individual layers
    class Layer{
        
    }


    //Pull all layer objects together to animate the entire game
    class Background{
        
    }

   //Draw timer, score and other infos
   class Ui{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context){
            //save entire state of canvas
            context.save();

            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize +'px'+ this.fontFamily;
            //score
            context.fillText('Score:' +this.game.score, 20, 40);
           //ammo
           for(let i = 0; i< this.game.ammo; i++){
            context.fillRect(20 +5*i,50,3,20);
           }
           //timer
           const formattedTime  = (this.game.gameTime * 0.001).toFixed(1);
           context.fillText('Timer:' +formattedTime, 20, 100)


           //game over message
           if(this.game.gameover){
            context.textAlign = 'center';
            let message1;
            let message2;
            if(this.game.score > this.game.winningScore){
                message1 = 'You win';
                message2 = 'Well done'
            } else{
                message1 = "You loose!";
                message2 = "Try again next time!";
            }
            context.font = '50px' +this.fontFamily;
            context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);


            context.font = '25px' +this.fontFamily;
            context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 +40);
            
           }


           //restores the most recently saved state of canvas
           context.restore();
        }
  }

   //All logic comes together here, it is the brain of the game
   class Game{
    constructor(width,height){
       
        this.width = width;
        this.height = height;
        this.player = new Player(this); 
        this.input = new InputHandler(this); 
        this.ui = new Ui(this);
        this.keys = []; //keep  track of all keys that are currently active
        this.enemies =[]; //hold all current active enemies
        this.enemyTimer = 0;
        this.enemyInterval = 1000;
        this.ammo = 20;
        this.maxAmmo = 50;
        this.ammoTimer = 0;
        this.ammoInterval = 500;
        this.gameover = false;
        this.score = 0;
        this.winningScore = 10;
        this.gameTime = 0; 
        this.timeLimit = 5000;
    }
   update(deltaTime){

    if(!this.gameover) this.gameTime += deltaTime;
    if(this.gameTime > this.timeLimit) this.gameover = true;



    this.player.update();
    if(this.ammoTimer > this.ammoInterval){
       if(this.ammo < this.maxAmmo) this.ammo++;
       this.ammoTimer = 0;
    }else{
        this.ammoTimer += deltaTime;
    }
    this.enemies.forEach(enemy => {
        enemy.update();
        //check collision between player and enemy
        if(this.checkCollision(this.player, enemy)){
            enemy.markedForDeletion = true;
        }
        //check each ennemy against all current active projectiles
        //if projectile touches enemy, projectile is deleted and enemy live is decremented by 1
        //if enemy live was 0 delete the enemy and increase player score
        this.player.projectiles.forEach(projectile=>{
            if(this.checkCollision(projectile, enemy)){
                enemy.lives--;
                projectile.markedForDeletion = true;
                if(enemy.lives<= 0){
                    enemy.markedForDeletion = true;
                   if(!this .gameover) this.score+= enemy.score;
                    //every time we increase score, we check if current score is more than winning score and if it is, game over
                    if(this.score > this.winningScore) this.gameover = true;
                }
            }
        })

    });

    //filter and delete all enemies marked for delete
    this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
    if(this.enemyTimer > this.enemyInterval && !this.gameover){
        this.addEnemy();
        this.enemyTimer = 0;

    } else{
        this.enemyTimer += deltaTime;
    }
 
}
   draw(context){
    this.player.draw(context)
    this.ui.draw(context)
    this.enemies.forEach(enemy => {
        enemy.draw(context);
    })
   }

   addEnemy(){
    this.enemies.push(new Angler1(this))
    console.log(this.enemies);
   }
   //check colllision
   //return true if objects collide and false if not
   //does this by comparing x and y coordinates, width and height
   checkCollision(rect1, rect2){
    return (
        rect1.x < rect2.x + rect2.width && 
        rect1.x + rect1.width >  rect2.x &&
        rect1.y < rect2.y + rect2.height && 
        rect1.y + rect1.height >  rect2.y

    )
   }

}

const game = new Game(canvas.width, canvas.height);
let lastTime = 0;
 //animation loop
 function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0,0,canvas.width, canvas.height)//delete all canvas drawings between each animation frame
    game.update(deltaTime);
    game.draw(ctx)
    requestAnimationFrame(animate) //tells the browser that we wish to perform an animation and it requests that the browser calls a specified function to update an animation before the next paint
 }
 animate(0);

})