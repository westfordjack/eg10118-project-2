//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
let adjust_speed = 12
let straight_speed = 20
//  Nominal speed of the robot
let left = true
//  Does the robot hug the left or right side of the line
let turn = 92
//  This number should represent a right turn
//  When a button is pressed it changes the side of the line and of the maze that the bot follows
if (input.buttonIsPressed(Button.A)) {
    left = true
}

if (input.buttonIsPressed(Button.B)) {
    left = false
}

//  Navigation parameters
let navigation = [[0, 0]]
//  List of all points visited by the robot
let direction = 0
//  Current direction. 0 = East, 1 = North, 2 = West, 3 = South
//  Current x and y of the robot
let x = navigation[0][0]
let y = navigation[0][1]
//  Lists of the locations of all known walls, so that checking is more efficient (less repetitive)
let hwalls = [[0, 0]]
let vwalls = [[0, 0]]
//  Create non-empty lists, then clear to avoid TypeScript type errors
_py.py_array_clear(hwalls)
_py.py_array_clear(vwalls)
//  Get magnetic baseline and set threshold for detecting a magnet
let baseline = Math.abs(input.magneticForce(Dimension.Z))
let magnetic_threshold = 100
//  in microteslas
//  Function to check if a magnet has been found
function magnet_found() {
    return Math.abs(input.magneticForce(Dimension.Z)) - baseline > magnetic_threshold
}

//  Set the robot to go tangent to the current edge of the line
function follow_line() {
    let difference: number;
    let turn_speed: number;
    
    //  Get offset from line (+3000 to -3000)
    let offset = CutebotPro.getOffset()
    //  If we want to follow the left side of the line, center ourselves at offset 1500
    if (true) {
        // left:
        difference = offset - 1500
        difference = difference > -1500 ? difference : -1500
    } else {
        //  If we want to follow the right side of the line, center ourselves at offset -1500
        difference = offset + 1500
        difference = difference < 1500 ? difference : 1500
    }
    
    //  Difference ranges from +1500 to -1500, tells how far from target
    //  If we have the line at all, scale turning speed with distance from line
    if (Math.abs(difference) != 1500) {
        turn_speed = straight_speed - Math.abs(difference) / 1500 * straight_speed
    } else {
        //  If we lost the line, set turn speed to spin in a circle
        turn_speed = -straight_speed
    }
    
    //  Turn left or right based on which side of target we are on
    if (difference > 0) {
        CutebotPro.pwmCruiseControl(straight_speed, turn_speed)
    } else {
        CutebotPro.pwmCruiseControl(turn_speed, straight_speed)
    }
    
}

//  Turning functions
function turn_right() {
    
    //  Turn right
    CutebotPro.trolleySteering(CutebotProTurn.RightInPlace, turn)
    //  Update direction, make sure rollover is ok
    direction = direction - 1
    if (direction < 0) {
        direction += 4
    }
    
}

function turn_left() {
    
    //  Turn left
    CutebotPro.trolleySteering(CutebotProTurn.LeftInPlace, turn)
    //  Update direction, make sure rollover is ok
    direction = (direction + 1) % 4
}

function turn_180() {
    
    //  Turn 180 degrees in place
    CutebotPro.trolleySteering(CutebotProTurn.LeftInPlace, turn * 2)
    //  Update directrion
    direction = (direction + 2) % 4
}

//  Checks for an obstacle
function obstacle() {
    let obstacle_there = CutebotPro.ultrasonic(SonarUnit.Inches) < 6
    //  If there is an obstacle, record its location in the proper array (for vertical or horizontal walls)
    if (obstacle_there) {
        if (direction == 0) {
            vwalls.push([x + 1, y])
        } else if (direction == 1) {
            hwalls.push([x, y + 1])
        } else if (direction == 2) {
            vwalls.push([x, y])
        } else {
            hwalls.push([x, y])
        }
        
    }
    
    //  Return whether or not an obstacle was found
    return obstacle_there
}

//  Move forward, updating direction
function forward() {
    
    
    //  Update position coordinates based on direction
    if (direction == 0) {
        x += 1
    } else if (direction == 1) {
        y += 1
    } else if (direction == 2) {
        x -= 1
    } else {
        y -= 1
    }
    
    //  Add new position to the list of seen points
    navigation.push([x, y])
    //  Record whether or not each sensor sees white
    let one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
    let four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
    //  Drive forward until we see the tape
    CutebotPro.pwmCruiseControl(adjust_speed, adjust_speed)
    while (one && four) {
        basic.pause(1)
        //  Update status of seeing/not seeing tape
        one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
        four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
    }
    //  Stop on the tape
    CutebotPro.pwmCruiseControl(0, 0)
    one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
    four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
    //  Turn right if only the left sensor sees the tape
    if (!one) {
        CutebotPro.pwmCruiseControl(0, adjust_speed)
        while (four) {
            basic.pause(1)
            four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
        }
    } else if (!four) {
        //  Turn left if only the right sensor sees the tape
        CutebotPro.pwmCruiseControl(adjust_speed, 0)
        while (one) {
            basic.pause(1)
            one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
        }
    }
    
    //  Repeat the same process, but for leaving the tape
    CutebotPro.pwmCruiseControl(0, 0)
    //  Check whether or not we see the tape and go forward
    one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
    four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
    CutebotPro.pwmCruiseControl(adjust_speed, adjust_speed)
    //  Go forward until we don't see the tape anymore
    while (one && four) {
        basic.pause(1)
        one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
        four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
    }
    //  Stop
    CutebotPro.pwmCruiseControl(0, 0)
    one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
    four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
    //  Turn right if only the left sensor sees the edge
    if (!one) {
        CutebotPro.pwmCruiseControl(0, adjust_speed)
        while (four) {
            basic.pause(1)
            four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
        }
    } else if (!four) {
        //  Turn left if only the right sensor sees the edge
        CutebotPro.pwmCruiseControl(adjust_speed, 0)
        while (one) {
            basic.pause(1)
            one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
        }
    }
    
    //  Stop
    CutebotPro.pwmCruiseControl(0, 0)
    //  Advance forward to the center of the current square
    CutebotPro.distanceRunning(CutebotProOrientation.Advance, 17, CutebotProDistanceUnits.Cm)
}

//  Broadcast the solution to another bot
function broadcast_solution() {
    let dx: number;
    let dy: number;
    
    //  String to add instructions
    let instructions = ""
    //  For each direction traveled
    for (let i = 1; i < navigation.length; i++) {
        //  Find change in x or y
        dx = navigation[i][0] - navigation[i - 1][0]
        dy = navigation[i][1] - navigation[i - 1][1]
        //  Send corresponding direction of the move represented by the dx/dy
        if (dx == 1) {
            instructions += "R"
        } else if (dx == -1) {
            //  Right
            instructions += "L"
        } else if (dy == 1) {
            //  Left
            instructions += "U"
        } else {
            //  Up
            instructions += "D"
        }
        
    }
    //  Down
    radio.sendString(instructions)
}

//  Send over the instructions
//  Optimize return solution
function optimize() {
    let last_icoord: number;
    let i: number;
    //  Optimize by removing hanging areas
    
    //  Create a copy of navigation
    let optimized = navigation.slice(0)
    //  Loop through navigation
    let cur_icoord = 0
    while (cur_icoord < optimized.length - 1) {
        last_icoord = optimized.length - 1
        //  Loop through all spots ahead of this one
        while (last_icoord > cur_icoord) {
            //  if the spots are the same
            if (optimized[cur_icoord][0] == optimized[last_icoord][0] && optimized[cur_icoord][1] == optimized[last_icoord][1]) {
                //  Delete all moves in between
                i = last_icoord
                while (i > cur_icoord) {
                    _py.py_array_pop(optimized, i)
                    i += -1
                }
                last_icoord = cur_icoord
            } else {
                last_icoord -= 1
            }
            
        }
        cur_icoord += 1
    }
    //  Set navigation list to this optimized one
    navigation = optimized
}

//  Checks if a 2d value is in a list
function inside(goal: number[], container: number[][]): boolean {
    //  Type declarations are needed because this is actually typescript in a python-shaped costume
    //  Loop through list
    for (let val of container) {
        //  If found, return true
        if (goal[0] == val[0] && goal[1] == val[1]) {
            return true
        }
        
    }
    //  Not found; return false
    return false
}

//  Get if there are known walls to the left and/or right of the bot
function get_surroundings(): boolean[] {
    let l: boolean;
    let r: boolean;
    
    
    
    
    
    //  Check if there are known walls in each cardinal direction
    let toward_0 = inside([x + 1, y], vwalls)
    let toward_1 = inside([x, y + 1], hwalls)
    let toward_2 = inside([x, y], vwalls)
    let toward_3 = inside([x, y], hwalls)
    //  Assign left and right based on the cardinal direction the robot is facing
    if (direction == 0) {
        l = toward_1
        r = toward_3
    } else if (direction == 1) {
        l = toward_2
        r = toward_0
    } else if (direction == 2) {
        l = toward_3
        r = toward_1
    } else {
        l = toward_0
        r = toward_2
    }
    
    //  Return results
    return [l, r]
}

//  Move forward one block in the maze
function move_block() {
    let obs_forward: any;
    let [obs_l, obs_r] = get_surroundings()
    //  Get the status of walls to the side for efficiency
    if (true) {
        //  left: # If we are following the left side of the line
        obs_forward = obstacle()
        //  Check if there is an obstacle in front
        if (!obs_l) {
            //  If there's no saved wall to the left
            //  Turn left--if no obstacle, go forward
            turn_left()
            if (!obstacle()) {
                forward()
            } else if (!obs_forward) {
                //  Otherwise, if no obstacle was in front, turn back and go
                turn_right()
                forward()
            } else if (!obs_r) {
                //  Otherwise, if there's no saved wall to the right, turn around and check
                turn_180()
                //  If there's no obstacle, go
                if (!obstacle()) {
                    forward()
                } else {
                    //  Otherwise, turn around and go back
                    turn_right()
                    forward()
                }
                
            } else {
                //  If there was a saved wall to the right, turn back
                turn_left()
                forward()
            }
            
        } else if (!obs_forward) {
            forward()
        } else if (!obs_r) {
            //  Otherwise, if there's no saved wall to the right, go check
            turn_right()
            //  If no obstacle, go; otherwise, turn back
            if (!obstacle()) {
                forward()
            } else {
                turn_right()
                forward()
            }
            
        } else {
            //  If there was a saved wall to the right, turn back
            turn_180()
            forward()
        }
        
    } else {
        //  If we're following the right wall
        obs_forward = obstacle()
        //  Check if there is an obstacle in front
        if (!obs_r) {
            //  If there's no saved wall to the right
            //  Turn right--if no obstacle, go forward
            turn_right()
            if (!obstacle()) {
                forward()
            } else if (!obs_forward) {
                //  Otherwise, if no obstacle was in front, turn back and go
                turn_left()
                forward()
            } else if (!obs_l) {
                //  Otherwise, if there's no saved wall to the left, turn around and check
                turn_180()
                //  If there's no obstacle, go
                if (!obstacle()) {
                    forward()
                } else {
                    //  Otherwise, turn around and go back
                    turn_left()
                    forward()
                }
                
            } else {
                //  If there was a saved wall to the right, turn back
                turn_right()
                forward()
            }
            
        } else if (!obs_forward) {
            forward()
        } else if (!obs_l) {
            //  Otherwise, if there's no saved wall to the left, go check
            turn_left()
            //  If no obstacle, go; otherwise, turn back
            if (!obstacle()) {
                forward()
            } else {
                turn_left()
                forward()
            }
            
        } else {
            //  If there was a saved wall to the left, turn back
            turn_180()
            forward()
        }
        
    }
    
}

//  Navigate the maze
function navigate_maze() {
    //  Move the first 5 squares to avoid seeing the magnet twice
    for (let i = 0; i < 5; i++) {
        move_block()
    }
    //  Move until we see the magnet
    while (!magnet_found()) {
        move_block()
    }
}

//  Function to head back to the start
function navigate_back() {
    let next_step: number[];
    let dx: number;
    let dy: number;
    let goal_direction: number;
    let change_dir: number;
    //  Optimize navigation path
    optimize()
    //  Broadcast optimized solution to the other micro BBC
    broadcast_solution()
    //  Add final instruction to exit the maze when done navigating back
    navigation.insertAt(0, [-1, 0])
    //  Loop through navigation steps
    let num_steps = navigation.length
    for (let step_num = 2; step_num < num_steps + 1; step_num++) {
        //  Loop backwards-- start at the last step
        next_step = navigation[num_steps - step_num]
        //  Get change in x and y
        dx = next_step[0] - x
        dy = next_step[1] - y
        //  Get the direction we need to move
        if (dx == 1) {
            goal_direction = 0
        } else if (dy == 1) {
            goal_direction = 1
        } else if (dx == -1) {
            goal_direction = 2
        } else {
            goal_direction = 3
        }
        
        //  Get how much we need to turn to face that direction, then turn
        change_dir = goal_direction - direction
        if (change_dir == 1 || change_dir == -3) {
            turn_left()
        } else if (change_dir == 2 || change_dir == -2) {
            turn_180()
        } else if (change_dir == 3 || change_dir == -1) {
            turn_right()
        }
        
        //  Move forward as long as we have space to move
        if (dx != 0 || dy != 0) {
            forward()
        }
        
    }
}

//  Celebration constants
let rad = 0
let countdown = 3
//  Swirl a dot out from center
function swirlOut() {
    let x: number;
    //  Create dot
    let my_sprite = game.createSprite(2, 2)
    // creates a sprite in the middle of the screen
    
    //  Loop through all points and move the sprite each step
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 2; j++) {
            for (x = 0; x < rad; x++) {
                my_sprite.move(1)
                // move one tile forward
                basic.pause(20)
            }
            //  Turn the sprite when it gets to the end
            my_sprite.turn(Direction.Right, 90)
        }
        rad = rad + 1
    }
    // adjusts radius of sprite's  movement so it swirls outwards
    for (x = 0; x < rad - 1; x++) {
        // extra movement at the end so the sprite comepletes a full rotation around the screen
        my_sprite.move(1)
        basic.pause(25)
    }
    my_sprite.delete()
}

// deletes the sprite so it doesn't remain on the screen during other sections of code
//  Swirl a dot back into the center; same process as swirling out
function swirlIn() {
    let my_sprite = game.createSprite(0, 4)
    // creates a sprite in the bottom left corner
    
    my_sprite.turn(Direction.Left, 90)
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 2; j++) {
            for (let x = 0; x < rad; x++) {
                my_sprite.move(1)
                basic.pause(20)
            }
            my_sprite.turn(Direction.Left, 90)
        }
        rad -= 1
    }
    // adjusts radius so every other line of movement is one less tile forward
    my_sprite.delete()
}

//  Celebration protocol
function celly() {
    //  Play fight song into
    music.play(music.stringPlayable("             A4 - C5 - B4 - A4 - G4 - E4 - C4 - D4 -             E4 G4 - F4 E4 - D4 - C4  ", 300), music.PlaybackMode.InBackground)
    //  Loop the main fight song
    music.play(music.stringPlayable(" E4 - - - D4 - E4 - F4 F4 - E4 F4 - - -                 F4 F4 - F4 E4 - F4 - G4 G4 - F4 G4 - - -                 A4 - C5 - B4 - A4 - G4 - E4 - C4 - - -                 E4 D4 - C4 E4 - D4 - C4 D4 - - G4 - - -                 E4 E4 - E4 D4 - E4 - F4 - - E4 F4 - - -                 F4 F4 - F4 E4 - F4 - G4 G4 - F4 G4 - - -                 A4 - C5 - B4 - A4 - G4 - E4 - C4 - D4 -                 E4 G4 - F4 E4 - D4 - C4 - ", 300), music.PlaybackMode.LoopingInBackground)
    //  Loop in the background the swirl animation and flashing the lights blue/green
    control.inBackground(function onIn_background() {
        while (true) {
            swirlIn()
            CutebotPro.colorLight(CutebotProRGBLight.RGBR, 0x00ff00)
            CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0x0000ff)
            basic.pause(100)
            swirlOut()
            CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0x00ff00)
            CutebotPro.colorLight(CutebotProRGBLight.RGBR, 0x0000ff)
            basic.pause(100)
        }
    })
}

//  Set correct radio group
radio.setGroup(6)
//  Follow the line until magnet is found
while (!magnet_found()) {
    follow_line()
    basic.pause(1)
}
//  Keep following after finding the magnet
for (let i = 0; i < 50; i++) {
    follow_line()
    basic.pause(1)
}
//  Go forward to the center of the first square
CutebotPro.distanceRunning(CutebotProOrientation.Advance, 17, CutebotProDistanceUnits.Cm)
//  Navigate, celebrate, head back, and spin once the robot leaves to celebrate even more!
navigate_maze()
celly()
navigate_back()
CutebotPro.cruiseControl(-100, 100, CutebotProSpeedUnits.Cms)
