var ydirection = 'something'; //holds the direction from player to destination in y direction
var xdirection = 'something'; //holds the direction from player to destination in x direction
var destX; //variable holding x coordinate the path is being made to
var destY; //variable holding y coordinate the path is being made to
var nextX; //variable holding x coordinate of next barrier in the x direction
var nextY; //variable holding y coordinate of next barrier in the y direction
var blockVert; //variable holding the object blocking the y direction
var blockHoriz;//variable holding the object blocking the x direction
var isBlocked = 0; //0 if not blocked true if blocked
var goalDirection; //the direction that the player needs to move to reach the goal
var goalY; //holds the y coordinate needed to be reached to go around the object
var goalX; //holds the x coordinate needed to be reached to go around the object
//as the code is right now, only one of these will be nonzero at a time
//since the zombie smacks into objects then moves around them while still touching
var exitDirection; //the direction that player needs to move after getting past obstacle
                    //makes sure that the player won't immediately go back into the same barrier
var findX; //variable for testing
var findY; //variable for testing
var PathfindingEntity = Entity.extend( {
  
   init: function(x, y, settings) {
    this.parent(x, y, settings);
  },


  update: function() {
    // this.findPath(this.producer.pos.x, this.producer.pos.y);

    this.updateMovement();
    this.parent(this);
  },
    //just finds the directions to the coordinates c, z; sets the destination coordinates
  // and the x and y directions
  findDirections: function(c, z) {
      if(this.destX != c || this.destY !=z){this.reset();}
      this.destX = c;
      this.destY = z; 
      if(z<this.top)
          {this.ydirection = 'Up';}
          else
              {this.ydirection = 'Down';}
      if(c<this.left)
          {this.xdirection = "Left";}
          else
              {this.xdirection = "Right";}
      if(c<= this.right && c>= this.left)
          {this.xdirection = "none";}
      if(z<= this.bottom && z>= this.top)
          {
              this.ydirection = 'none';
          }
          
  },
  //move functions, move the sprite in the specified direction, and the player is within one movement
  //of a wall, instead of uselessly not going anywhere as the engine makes it, teleports the player
  //so that they are right up against the wall.
  moveUp: function() {
      if(this.amBlocked("Up") && this.nextY<=this.top)
          {this.pos.y = this.nextY;}
    this.vel.y -= this.accel.y;
    this.direction = "up";
  },
  moveDown: function() {
      if(this.amBlocked("Down") && this.nextY>=this.bottom)
          {this.pos.y = this.nextY - this.height;}
      this.vel.y += this.accel.y;
      this.direction = "down";
  },
  moveLeft: function() {
      if(this.nextX>=this.left-3 && this.nextX<=this.left)
          {
              this.pos.x = this.nextX;
          }
              {this.vel.x -= this.accel.x;}
      this.direction = "left";
  },
  moveRight: function() {
  if(this.nextX <= this.right+3 && this.nextX>=this.right)
      {this.posX = this.nextX-this.width-1;}
    this.vel.x += this.accel.x;
    this.direction = "right";
  },
  //the function that should be called by other entities, the one that starts everything.
  findPath: function(c, z) {
    this.findDirections(c,z);
    if(this.xdirection == "none" && this.ydirection == "none"){this.reset();}
    this.getLimits();
    if(this.isBlocked)
        {
                this.goAround();
        }
        else
            {
                this.makeMove();
            }
  },
   findBlock: function() {
   var n = this.blockDirection;
   //very useful debugging line
  //console.log("the crazy n " + n + " pos " + this.pos);
  switch(n)
  {
      //"Up"
      case 1: 
          {
              this.goalX = this.openUp();
              if(this.goalX>=this.left && this.goalX<=this.right-1)
                  {this.goalDirection = this.xdirection; break}
                  else{
              if(this.goalX < this.pos.x)
                  {
                      this.goalDirection = "Left";
                  }else
                          {
                              this.goalDirection = "Right";
                          }}
              this.exitDirection = "Up";
              if(this.atLimit(this.exitDirection)){this.exitDirection = "none";}
              break;
          }
          //"Down"
      case 2:
          {
              this.goalX = this.openDown();
              if(this.goalX>=this.left && this.goalX<=this.right-1)
                  {
                      this.goalDirection = this.xdirection;
                      if(this.xdirection == "none")
                          {
                              if(this.destX<= this.goalX){this.goalDirection ="Left";}
                              else{this.goalDirection = "Right";}
                          }
                  }
                  else{
                  if(this.goalX < this.pos.x)
                  {
                      this.goalDirection = "Left";
                  }else
                          {
                              this.goalDirection = "Right";
                          }
                  }
              this.exitDirection = "Down";
              break;
          }
          //"Left"
      case 3:
          {
              this.goalY = this.openLeft();
                   if(this.goalY<=this.bottom && this.goalY>=this.top)
              {
                   if(this.ydirection == "none")
                   {
                         if(this.goalY<=this.destY){this.goalDirection = "Up";}
                         else{this.goalDirection = "Down";}
                    }
                    else
                         {this.goalDirection = this.ydirection;}
              }
              if(this.goalY<this.pos.y){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
              this.exitDirection = "Left";
              break;
          }
          //"Right"
      case 4:
          {
              this.goalY = this.openRight();
              if(this.goalY<=this.bottom && this.goalY>=this.top)
                  {
                      if(this.ydirection == "none")
                          {
                              if(this.goalY<=this.destY)
                              {this.goalDirection = "Up";}
                              else{this.goalDirection = "Down";}
                          }
                          else
                              {this.goalDirection = this.ydirection;}
                  }
                  else{
              if(this.goalY<this.pos.y){this.goalDirection = "Up";}else{this.goalDirection = "Down";}}
              this.exitDirection = "Right";
              break;
          }
          //"UpLeft
      case 5:
          {
              if((this.amBlocked("Up") && this.amBlocked("Left")) || (this.left<=this.nextX+1 && this.top<=this.nextY+1))
                  {
                      
                      this.goalX = this.openUp();
                      this.goalY = this.openLeft();
                      if(this.destX < this.pos.x)
                          {this.exitDirection = "Left";}else{this.exitDiretion = "Right";}
                      if(this.isObject(this.top, this.goalX) && this.isObject(this.goalY,this.left))
                          {
                              console.log("Critical failure");
                          }
                          else
                              {
                                  if(this.destX<this.pos.x)
                                      {this.exitDirection = "Left";}else{this.exitDirection = "Right";}    
                                      if(this.goalY<this.posY){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                                      if(this.amBlocked(this.goalDirection) && !this.amBlocked(this.exitDirection))
                                          {
                                              var temp;
                                              this.goalY = 0;
                                              temp = this.exitDirection;
                                              this.exitDirection = this.goalDirection;
                                              this.goalDirection = temp;
                                          }
                                          else
                                              {this.goalX = 0;}                                  
                              }                              
                              break;
                  }
              if(this.amBlocked("Up"))
                  {
                      this.checkMoveUp();
                      break;
                  }
              if(this.amBlocked("Left"))
                  {
                      this.checkMoveLeft();
                      break;
                  }
                  console.log("fail");
                  break;
          }
          //UpRight
      case 6:
          {
              if((this.nextY>=this.top-1 && this.nextX<=this.right+1) || (this.amBlocked("Up") && this.amBlocked("Right")))
                  {
                      this.goalX = this.openUp();
                      this.goalY = this.openRight();
                                            if(this.destX < this.pos.x)
                          {this.exitDirection = "Left";}else{this.exitDiretion = "Right";}
                      if(this.isObject(this.goalX, this.top) && this.isObject(this.right, this.goalY))
                          {
                              console.log("Critical failure, upright");
                          }
                          else
                              {
                                  if(this.goalY<this.posY){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                                      if(this.amBlocked(this.goalDirection) && !this.amBlocked(this.exitDirection))
                                          {
                                              var temp1;
                                              this.goalY = 0;
                                              temp1 = this.exitDirection;
                                              this.exitDirection = this.goalDirection;
                                              this.goalDirection = temp1;
                                          }
                                          else
                                              {this.goalX = 0;}
                              }
                              break;
                  }
                  if(!this.isObject(this.right, this.top-1) && !this.isObject(this.left,this.top-1))
                      {
                          this.goalX = this.openUp();
                          this.exitDirection = "Up";
                          if(this.goalX <this.pos.x){this.goalDirection = "Left";}else{this.goalDirection = "Right";}
                          break;
                      }
                   if(!this.isObject(this.right+1, this.top) && !this.isObject(this.right+1,this.bottom))
                       {
                           this.goalY = this.openRight();
                           if(this.goalY < this.pos.y){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                           this.exitDirection = "Right";
                           break;
                       }
                       break;
          }
          //downleft
      case 7:
          {
              if((this.amBlocked("Down") && this.amBlocked("Left")) || (this.nextX<=this.left-1 && this.nextY<=this.bottom+1))
                  {
                      this.goalX = this.openDown();
                      this.goalY = this.openLeft();
                                            if(this.destX < this.pos.x)
                          {this.exitDirection = "Left";}else{this.exitDiretion = "Right";}
                      if(this.isObject(this.goalX, this.bottom) && this.isObject(this.left, this.goalY))
                          {
                              console.log("critical failure downleft");
                          }
                          else
                              {
                                  if(this.goalY<this.posY){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                                      if(this.amBlocked(this.goalDirection) && !this.amBlocked(this.exitDirection))
                                          {
                                              var temp2;
                                              this.goalY = 0;
                                              temp2 = this.exitDirection;
                                              this.exitDirection = this.goalDirection;
                                              this.goalDirection = temp2;
                                          }
                                          else
                                              {this.goalX = 0;}
                              }
                              break;
                  }
              if(!this.amBlocked("Down"))
                  {
                      this.goalY = this.openLeft();
                      if(this.goalY < this.pos.y){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                      break;
                  }
              if(!this.amBlocked("Left"))
                  {
                      this.goalX = this.openDown();
                      if(this.goalX <this.pos.x){this.goalDirection = "Left";}else{this.goalDirection = "Right";}
                      break;
                  }
                  break;
          }
          //downright
      case 8:
          {
              if((this.nextY<=this.bottom+1 && this.nextX<=this.right+1) || (this.amBlocked("Down") && this.amBlocked("Right")))
                  {
                      this.goalX = this.openDown();
                      this.goalY = this.openRight();
                                            if(this.destX < this.pos.x)
                          {this.exitDirection = "Left";}else{this.exitDiretion = "Right";}
                      if(this.isObject(this.goalX, this.bottom) && this.isObject(this.right, this.goalY))
                          {
                              console.log("Critical failure!");
                          }
                          else
                              {
                                  if(this.destX<this.pos.x)
                                      {this.exitDirection = "Left";}else{this.exitDirection = "Right";}    
                                      if(this.goalY<this.posY){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                                      if(this.amBlocked(this.goalDirection) && !this.amBlocked(this.exitDirection))
                                          {
                                              var temp3;
                                              this.goalY = 0;
                                              temp3 = this.exitDirection;
                                              this.exitDirection = this.goalDirection;
                                              this.goalDirection = temp3;
                                          }
                                          else
                                              {this.goalX = 0;}        
                              }
                              break;
                  }
              if(!this.amBlocked("Right"))
                  {
                      this.checkMoveRight();
                      break;
                  }
              if(!this.amBlocked("Down"))
                  {
                      this.goalY = this.openRight();
                      if(this.goalY < this.pos.y){this.goalDirection = "Up";}else{this.goalDirection = "Down";}
                      this.exitDirection = "Right";
                      break;
                  }
                  break;
          }
  }
},
goAround: function() {
      if(this.goalY == 0 && this.goalX == 0)
          {
              this.findBlock();
              // useful for debugging
             //    console.log(this.blockDirection + " the goals goalX " + this.goalX + " goalY " + this.goalY);
          }
       if(this.goalY == 0)
           {
               if(this.moveCheck(this.exitDirection))
                   {
                       this.goalX = 0;
                       this.isBlocked = 0;
                       this.goalDirection = null;
                   }
                   else
                       {
                           if(this.goalDirection == "Left")
                               {
                                   this.moveLeft();
                               }
                               else{this.moveRight();}
                       }
           }
       else
       {
           if(this.moveCheck(this.exitDirection))
               {
                   this.moveCheck(this.exitDirection);
                   this.goalY = 0;
                   this.isBlocked = 0;
                   this.goalDirection = null;
               }
           else
               {
                   if(this.goalDirection == "Up")
                       {
                           if(!this.checkMoveUp())
                               {
                                   this.goalDirection = "Down";
                               }
                       }
                       else{
                           if(!this.checkMoveDown())
                               {                                   
                                   this.goalDirection = "Up";
                               }
                       }
               }
       }
      //this.reachedGoal();
  },
  //open functions weigh the answers from the look functions, decide which of the possible directions
// is best to go in. Prioritizes searching in the direction of the destination.
  openUp: function() {
    switch(this.xdirection)
    {
        
        case "Left":
            {
                
                var test = this.lookLeft(this.blockVert.left);
                var test1;
                if(this.isObject(test, this.blockVert.bottom-1))
                    {
                        test1 = this.lookRight(this.blockVert.right-1);
                        if(this.isObject(test1, this.blockVert.bottom-1))
                            {return test;}
                            else{
                                return test1;
                            }
                    }
                    return test;
            }
        case "Right":
            {
                var test2 = this.lookRight(this.blockVert.right-1);
                var test3;
                if(this.isObject(test2,this.blockVert.bottom-1))
                    {
                        test3 = this.lookLeft(this.blockVert.left);
                        if(this.isObject(test3,this.blockVert.bottom-1))
                            {return test2;}
                            else
                                {
                                    return test3;
                                }
                    }
                    return test2;
            }
        case "none":
            {
                var test4 = this.lookLeft(this.blockVert.left);
                var test5;
                if(this.isObject(test4, this.blockVert.bottom-1))
                    {
                        test5 = this.lookRight(this.blockVert.right-1);
                        if(this.isObject(test5, this.blockVert.bottom-1))
                            {return test4;}
                            else{
                                return test5;
                            }
                    }
                    return test4;
            }
    }
  },
  openDown: function() {
      var n = this.xdirection;
    switch(n)
    {
        case "Left":
            {
                var test = this.lookLeft(this.blockVert.left-1);
                var test1;
                if(this.isObject(test, this.blockVert.top))
                    {
                        test1 = this.lookRight(this.blockVert.right-1);
                        if(this.isObject(test1, this.blockVert.top))
                            {return test;}
                            else{
                                return test1;
                            }
                    }
                    return test;
            }
        case "Right":
            {
                var test2 = this.lookRight(this.blockVert.right);
                var test3;
                if(this.isObject(test2,this.blockVert.top))
                    {
                        test3 = this.lookLeft(this.blockVert.left);
                        if(this.isObject(test3,this.blockVert.top))
                            {return test2;}
                            else
                                {
                                    return test3;
                                }
                    }
                    return test2;
            }
        case "none":
            {
                var test4 = this.lookLeft(this.blockVert.left);
                var test5;
                if(this.isObject(test4, this.blockVert.top))
                    {
                        test5 = this.lookRight(this.blockVert.right-1);
                        if(this.isObject(test5, this.blockVert.top))
                            {return test4;}
                            else{
                                return test5;
                            }
                    }
                    return test4;
            }
    }
  },
  openLeft: function() {
      var n = this.ydirection;
    switch(n)
    {
        case "Up":
            {
                var test = this.lookUp(this.blockHoriz.top);
                var test1;
                if(this.isObject(this.blockHoriz.right-1, test))
                    {
                        test1 = this.lookDown(this.blockHoriz.bottom);
                        if(this.isObject(this.blockHoriz.right-1, test1))
                            {return test;}
                            else{
                                return test1;
                            }
                    }
                    return test;
            }
        case "Down":
            {
                var test2 = this.lookDown(this.blockHoriz.bottom);
                var test3;
                if(this.isObject(this.blockHoriz.right,test2))
                    {
                        test3 = this.lookUp(this.blockHoriz.top);
                        if(this.isObject(this.blockHoriz.right, test3))
                            {return test2;}
                            else
                                {
                                    return test3;
                                }
                    }
                    return test2;
            }
        case "none":
            {
                
                var test4 = this.lookUp(this.blockHoriz.top);
                var test5;
                if(this.isObject(this.blockHoriz.right, test4))
                    {
                        test5 = this.lookDown(this.blockHoriz.bottom);
                        if(this.isObject(this.blockHoriz.right, test5))
                            {return test4;}
                            else{
                                return test5;
                            }
                    }
                    return test4;
            }
    }
  },
  openRight: function() {
    switch(this.ydirection)
    {
        case "Up":
            {
                var test = this.lookUp(this.blockHoriz.top);
                var test1;
                if(this.isObject(this.blockHoriz.left-1, test))
                    {
                        test1 = this.lookDown(this.blockHoriz.bottom-1);
                        if(this.isObject(this.blockHoriz.right, test1))
                            {return test;}
                            else{
                                return test1;
                            }
                    }
                    return test1;
            }
        case "Down":
            {
                var test2 = this.lookDown(this.blockHoriz.bottom-1);
                var test3;
                if(this.isObject(this.blockHoriz.left-1,test2))
                    {
                        test3 = this.lookUp(this.blockHoriz.top);
                        if(this.isObject(this.blockHoriz.left-1, test3))
                            {return test2;}
                            else
                                {
                                    return test3;
                                }
                    }
                    return test2;
            }
        case "none":
            {
                var test4 = this.lookUp(this.blockHoriz.top);
                var test5;
                if(this.isObject(this.blockHoriz.left-1, test4))
                    {
                        test5 = this.lookDown(this.blockHoriz.bottom-1);
                        if(this.isObject(this.blockHoriz.right, test5))
                            {return test4;}
                            else{
                                return test5;
                            }
                    }
                    return test4;
            }
    }
  },
  //look functions search from the sprite towards the direction specified stopping when either a gap is found
  //that the sprite can fit through, or reach a barrier that it cannot pass. Returns coordinates for
  //an impassable object if a gap cannot be found.
  lookLeft: function(barrier){
      var lefty = barrier;
      var done = 0;
      var possible = 0;
      var ybarrier;
      if(this.amBlocked("Left")){return barrier;}
      if(this.blockVert == "null"){console.log("problem");}
      if(this.blockVert.pos.y <= this.pos.y)
          {
              ybarrier = this.blockVert.bottom-1;
          }
          else{ybarrier = this.blockVert.top;} 
          this.leftLimit();
      while(lefty>=this.nextX && !done && possible == 0)
            {                   
                 lefty-=1;
                 if(!this.isObject(lefty, ybarrier) && lefty>=this.nextX)
                {
                    possible = lefty;
                    for(var i = 0; i<this.width && !this.isObject(possible, ybarrier); i++)
                        {
                            possible -=1;
                        }
                        if(!this.isObject(possible, ybarrier))
                            {done = true;}else{lefty = possible; possible = 0;}
                }
            }
            if(lefty<this.nextX){lefty = this.nextX;}
            this.getLimits();
       return lefty; 
  },
  lookRight: function(barrier) {
    var righty = barrier;
    var done = 0;
    var possible = 0;
    var ybarrier;
      if(this.blockVert.pos.y < this.pos.y)
          {
              ybarrier = this.blockVert.bottom;
          }
          else{ybarrier = this.blockVert.top;}  
    while(righty<=me.game.collisionMap.width && !done && possible == 0)
        {
          righty+=1;
          possible = righty;
          if(!this.isObject(righty, ybarrier) && righty <= (me.collisionMap.width-this.width))
          {
            possible = righty;
            for(var i = 0; i<this.width && !this.isObject(possible, ybarrier); i++)
                {
                    possible+=1;
                }
                if(!this.isObject(possible, ybarrier))
                    {done = true;}
                    else{righty = possible; possible = 0;}
          }          
        }
    return righty;
  },
  lookUp: function(barrier) {
      var xbarrier;
      var possible = 0;
      var done = 0;
      var uppy = barrier;
      if(this.blockHoriz.pos.x <this.pos.x)
          {xbarrier = this.blockHoriz.right-1;}else{xbarrier = this.blockHoriz.left;}
      while(uppy>=32 && !done && this.isObject(xbarrier, uppy))
          {
              uppy-=1;
              possible = uppy;
              for(var i = 0; i<this.height && !this.isObject(xbarrier, possible); i++)
                  {
                   possible-=1;
                  }
              if(!this.isObject(xbarrier, possible))
                  {
                      done = true;
                  }
                  else
                      {
                          uppy = possible;
                          possible = 0;
                      }
          }
          return uppy;
  },
  lookDown: function(barrier) {
      var xbarrier;
      var possible = 0;
      var done = 0;
      var downy = barrier-1;
      if(this.bottom>=this.nextY-1 && this.ydirection == "Down"){return this.blockHoriz.top+1;}
      if(this.blockHoriz.pos.x <this.pos.x)
          {xbarrier = this.blockHoriz.right-1;}else{xbarrier = this.blockHoriz.left;}
      while(downy<=this.collisionMap.realheight-4 && !done && possible == 0)
          {
              downy+=1;
              possible = downy;
              for(var i = 0; i<this.height && !this.isObject(xbarrier, possible); i++)
                  {
                   possible+=1;
                  }
              if(!this.isObject(xbarrier, possible))
                  {
                     done = true;
                  }
                  else
                      {
                          downy = possible;
                          possible = 0;
                      }
          }
          return downy;    
  },
    //the check set of functions, returns true if the move is possible, false if not
    //Also sets the block direction, so that the findblock method knows which directions to search
    checkMoveUp: function() {
      if(this.amBlocked("Up"))
          {
              this.moveUp();
              this.blockDirection = 1;
              return 0;              
          }
          else
              {
                  this.moveUp();
                  return true;
              }
  },
  checkMoveDown: function(){
        if(this.amBlocked("Down"))
          {
              this.moveDown();
              this.blockDirection = 2;
              return 0;
          }
          else
              {
                  this.moveDown();
              }
              return true;
  },
  checkMoveRight: function(){
    if(this.amBlocked("Right"))
        {
            this.moveRight();
            this.blockDirection = 4;
            return 0;
        }
        else
            {
                this.moveRight();
                return true;
            }
      
  },
  checkMoveLeft: function(){
    if(this.amBlocked("Left"))
        {
            this.moveLeft();
            this.blockDirection = 3;
            return 0;
        }
        else
            {
                this.moveLeft();
            }
            return true;
         
  },
  checkMoveUpLeft: function(){
    if((this.nextY>= this.top-1 && this.nextX>=this.left-1) || this.isObject(this.left-1, this.top-1))
        {
           this.blockDirection = 5;
            return 0;
        }
        if(!this.checkMoveUp())
            {return this.checkMoveLeft();}
        else
            {
                this.checkMoveLeft();
               return true;
            }
        return true;      
  },
  checkMoveUpRight: function(){
    if(this.isObject(this.right, this.top-1) || (this.nextY>=this.top-1 && this.nextX<=this.right+1))
        {
            this.blockDirection = 6;
            return 0;
        }
        if(!this.checkMoveUp())
       {return this.checkMoveRight();}
       else
           {
               this.checkMoveRight();
               return true;
           }
        return true;
  },
  checkMoveDownLeft: function(){
    if(this.isObject(this.left, this.bottom) || (this.nextY<= this.bottom-1 && this.nextX>=this.left-1)) 
        {
            this.blockDirection = 7;
            return 0;
        }
       if(!this.checkMoveDown())
           {
               return this.checkMoveLeft();
           }
           else
           {
               this.checkMoveLeft();
               return true;
           }
        return true;
  },
  checkMoveDownRight: function(){
      if(me.game.collisionMap.getTile(this.right+1, this.bottom+1) != null || (this.amBlocked("Down") && this.amBlocked("Right")))
          {
              this.blockDirection = 8;
              return 0;
          }
          if(!this.checkMoveDown())
              {return this.checkMoveRight();}
              else
              {this.checkMoveRight();return true;}
          return true;
  },
  //finds the next barrier in the two destination directions
  getLimits: function() {
    if(this.ydirection == "Up")
        {
            this.upperLimit();
        }
        else
            {
                if(this.ydirection == "Down")
                    {this.lowerLimit();}                
            }
    if(this.xdirection == "Left")
        {
          this.leftLimit();
        }
        else
            {
                    this.rightLimit();                
            }
  },
  //limit functions check every tile until they reach the edge of the map to find out where the next wall is
  upperLimit: function() {
      var testY = this.top-this.top%32-1;
      var blocked = 0;
      var dealie;
      while(!blocked && testY>0)
          {
              if((me.game.collisionMap.getTile(this.left, testY) != null))
                  {
                      blocked = true;
                      dealie = me.game.collisionMap.getTile(this.left, testY);
                  }
                  else{
                  if((me.game.collisionMap.getTile(this.right, testY) != null))
                  {
                                  blocked = true;
                                  dealie = me.game.collisionMap.getTile(this.right, testY);
                  }
                  else
                  {
                         testY-=1;
                  }}
                      
          }
          if(blocked)
          {
          this.nextY = dealie.bottom;
          this.blockVert = dealie;
          
          }
          else
              {
                this.nextY = this.destY;
              }
          return blocked;
  },
  lowerLimit: function() {
      var testY = this.bottom;
      var blocked = 0;
      var dealie;
      while(!blocked && testY<me.game.collisionMap.realheight)
          {
              if((me.game.collisionMap.getTile(this.left, testY) != null))
                  {
                      blocked = true;
                      dealie = me.game.collisionMap.getTile(this.left, testY);
                  }
                  else
                      {
                          if(this.isObject(this.right-1, testY))
                              {
                                  blocked = true;
                                  dealie = me.game.collisionMap.getTile(this.right-1, testY);
                              }
                              else
                                  {testY+=1;}
                      }
          }
          if(blocked)
              {                 
                  this.nextY = dealie.top;
                  this.blockVert = dealie;
              }
              else
                  {this.nextY = this.destY}
          return blocked;
  },
  leftLimit: function() {
      var testX = this.left-1;
      var blocked = 0;
      var dealie; 
      while(!blocked && testX>32)
          {
              if((me.game.collisionMap.getTile(testX, this.top) != null))
                  {
                      
                      blocked = true;
                      dealie = me.game.collisionMap.getTile(testX, this.top);
                  }
                  else                  
                      {
                          if(me.game.collisionMap.getTile(testX, this.bottom-1) != null)
                              {
                                  dealie = me.game.collisionMap.getTile(testX, this.bottom);
                                  blocked = true;
                              }
                              else
                                  {
                                      testX-=1;
                                  }                          
                      }
          }
          if(blocked) {
            // Added this in because game was locking up
            if (dealie !== null) {
              this.nextX = dealie.right;
            }
            this.blockHoriz = dealie;
          }
          else
              {this.nextX = this.destX;}
          return blocked;
  },
  rightLimit: function() {
      var testX = this.right-1;
      var blocked = 0;
      var dealie;
      while(!blocked && testX<me.game.collisionMap.realwidth)
          {
              if(this.isObject(testX, this.top))
                  {
                      dealie = me.game.collisionMap.getTile(testX, this.top);
                      blocked = true;
                  }
                  else
                      {
                          if(this.isObject(testX,this.bottom-1))
                              {
                                  dealie = me.game.collisionMap.getTile(testX, this.bottom-1);
                                  blocked = true;
                              }
                              else {testX+=1;}
                      }
          }
          if(blocked)
              {this.nextX = dealie.left;this.blockHoriz = dealie;}
              else
                  {this.nextX = this.destX;}
          return blocked;
  },
  //decides which move to attempt, sets the state of the player to blocked if cannot move
  makeMove: function() {
      if(this.xdirection == "Left")
        {
          if(this.ydirection == "Up")
              {
                  if(!this.checkMoveUpLeft())
                      {
                        this.isBlocked = true;
                        return 0;
                      }
              }
              else
                  {
                      if(this.ydirection == "Down")
                          {
                              if(!this.checkMoveDownLeft())
                                  {
                                      this.isBlocked = true;
                                      return 0;
                                  }
                          }
                          else
                              {
                                  if(!this.checkMoveLeft())
                                      {
                                          this.isBlocked = true;
                                          return 0;
                                      }
                              }                          
                  }

        }
        else
            {
                if(this.xdirection == "none")
                    {
                        if(this.ydirection == "Up")
                            {
                                if(!this.checkMoveUp())
                                    {
                                        this.isBlocked = true;
                                        return 0;
                                    }
                            }
                            else
                                {
                                    if(this.ydirection == "none")
                                        {}
                                        else
                                            {
                                                if(this.ydirection == "Down")
                                                    {
                                                        if(!this.checkMoveDown())
                                                            {
                                                                this.isBlocked = true;
                                                                return 0;
                                                            }
                                                    }
                                            }
                                }
                    }
                    else
                        {
                            if(this.xdirection == "Right")
                                {
                                    if(this.ydirection == "none")
                                        {
                                            if(!this.checkMoveRight())
                                                {
                                                    this.isBlocked = true;
                                                    return 0;
                                                }
                                        }
                                        else
                                            {
                                                if(this.ydirection == "Up")
                                                    {
                                                        if(!this.checkMoveUpRight())
                                                            {
                                                                this.isBlocked = true;
                                                                return 0;
                                                            }
                                                    }
                                                    else
                                                        {
                                                            if(this.ydirection == "Down")
                                                                {
                                                                    if(!this.checkMoveDownRight())
                                                                        {
                                                                            this.isBlocked = true;
                                                                            return 0;
                                                                        }
                                                                }
                                                        }
                                            }
                                }
                        }
            }
        this.isBlocked = 0;
        return true;
  },
  //a reset so that when the destination is reached pathfinding will stop
  reset: function()
  {
      this.isBlocked = 0;
      this.goalY = 0;
      this.goalX = 0;
      this.exitDirection = "none";
      this.goalDirection = null;
  },
  //test to see if there is a collidable object located in the tile containing the pixel at
  //the coordinates o, j(x,y)
  isObject: function(o, j) {
      if(me.game.collisionMap.getTile(o, j) != null)
          {
              return true;
          }
          else
              {
                  return 0;
              }
  },
  //simple function allowing for the ability to call a move command with a variable direction
  moveCheck: function (direction)
  {
    var n = direction;
    switch(n)
    {
        case "Up": {return this.checkMoveUp();break;}
        case "Down": {return this.checkMoveDown();break;}
        case "Left": {return this.checkMoveLeft();break;}
        case "Right": {return this.checkMoveRight();break;}
        case "none": {this.exitDirection = this.goalDirection; return 0;break;}
    }
  },
  //checks to see if making a move will force the player to collide with a wall, with offsets to compensate
  //for melonjs overestimation of right and bottom, also the fact that if you are attempting to move past
  //a wall the engine will stop the sprite several pixels off
  amBlocked: function (direction)
  {
      n = direction;
      switch(n)
      {
          case "Up": {
                  if(this.isObject(this.left, this.top-3) || this.isObject(this.right-1, this.top-3))
                      {return true;}else{return 0;}
          }
          case "Down":{
                  if(this.isObject(this.left, this.bottom+2) || this.isObject(this.right-1, this.bottom+2)){return true;}else{return 0;}
          }
          case "Left": {
                  if(this.isObject(this.left-3, this.top) || this.isObject(this.left-3, this.bottom-1)){return true;}else{return 0;}
          }
          case "Right": {
                  if(this.isObject(this.right+2, this.top) || this.isObject(this.right+2, this.bottom-1)){return true;}else{return 0;}
          }
      }
  },
  atLimit: function(direction){
      var n = direction;
      switch(n)
      {
          case "Up": {if(this.top<=me.game.currentLevel.tileheight){return true;}}
      }
  }
});
