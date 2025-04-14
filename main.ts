//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
radio.setGroup(7)
let adjust_speed = 12
let straight_speed = 20
//  Nominal speed of the robot
let left = true
//  Does the robot hug the left or right side of the line
let turn = 92
//  This number should represent a right turn
function red() {
    function onIn_background() {
        for (let i = 0; i < 3; i++) {
            CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0xff0000)
            basic.pause(500)
            CutebotPro.turnOffAllHeadlights()
        }
        basic.pause(500)
    }
    
}

function green() {
    control.inBackground(function onIn_background() {
        for (let i = 0; i < 3; i++) {
            CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0x00ff00)
            basic.pause(500)
            CutebotPro.turnOffAllHeadlights()
        }
        basic.pause(500)
    })
}

function blue() {
    control.inBackground(function onIn_background() {
        for (let i = 0; i < 3; i++) {
            CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0x0000ff)
            basic.pause(500)
            CutebotPro.turnOffAllHeadlights()
        }
        basic.pause(500)
    })
}

function yellow() {
    control.inBackground(function onIn_background() {
        for (let i = 0; i < 3; i++) {
            CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0xffff00)
            basic.pause(500)
            CutebotPro.turnOffAllHeadlights()
        }
        basic.pause(500)
    })
}

//  when a button is pressed it changes the side the bot follows
if (input.buttonIsPressed(Button.A)) {
    left = true
}

if (input.buttonIsPressed(Button.B)) {
    left = false
}

//  Navigation parameters
let navigation = [[0, 0]]
let direction = 0
//  0 = East, 1 = North, 2 = West, 3 = South
let x = navigation[0][0]
let y = navigation[0][1]
//  Wall finding efficiency
let hwalls = [[0, 0]]
let vwalls = [[0, 0]]
_py.py_array_clear(hwalls)
//  Clear to avoid TypeScript type errors
_py.py_array_clear(vwalls)
//  Magnetic baseline and threshold
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
    if (left) {
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
    CutebotPro.pwmCruiseControl(0, 0)
    CutebotPro.trolleySteering(CutebotProTurn.RightInPlace, turn)
    //  Update direction, make sure rollover is ok
    direction = direction - 1
    if (direction < 0) {
        direction += 4
    }
    
}

function turn_left() {
    
    //  Turn left
    CutebotPro.pwmCruiseControl(0, 0)
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
    
    
    //  Update position coordinates
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
    let two = CutebotPro.trackbitgetGray(TrackbitChannel.Two) < 200
    let three = CutebotPro.trackbitgetGray(TrackbitChannel.Three) < 200
    let four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
    //  Drive forward until we see the tape
    CutebotPro.pwmCruiseControl(adjust_speed, adjust_speed)
    while (one && two && three && four) {
        control.waitMicros(100)
        one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
        two = CutebotPro.trackbitgetGray(TrackbitChannel.Two) < 200
        three = CutebotPro.trackbitgetGray(TrackbitChannel.Three) < 200
        four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
    }
    //  Stop on the tape
    CutebotPro.pwmCruiseControl(0, 0)
    one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
    two = CutebotPro.trackbitgetGray(TrackbitChannel.Two) < 200
    three = CutebotPro.trackbitgetGray(TrackbitChannel.Three) < 200
    four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
    //  Turn right if only the left sensor sees the tape
    if (!one) {
        CutebotPro.pwmCruiseControl(0, adjust_speed)
        while (four) {
            control.waitMicros(100)
            four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) < 200
        }
    } else if (!four) {
        //  Turn left if only the right sensor sees the tape
        CutebotPro.pwmCruiseControl(adjust_speed, 0)
        while (one) {
            control.waitMicros(100)
            one = CutebotPro.trackbitgetGray(TrackbitChannel.One) < 200
        }
    }
    
    // # Repeat the same process, but for leaving the tape
    CutebotPro.pwmCruiseControl(0, 0)
    one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
    two = CutebotPro.trackbitgetGray(TrackbitChannel.Two) > 200
    three = CutebotPro.trackbitgetGray(TrackbitChannel.Three) > 200
    four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
    CutebotPro.pwmCruiseControl(adjust_speed, adjust_speed)
    while (one && two && three && four) {
        control.waitMicros(100)
        one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
        two = CutebotPro.trackbitgetGray(TrackbitChannel.Two) > 200
        three = CutebotPro.trackbitgetGray(TrackbitChannel.Three) > 200
        four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
    }
    CutebotPro.pwmCruiseControl(0, 0)
    one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
    two = CutebotPro.trackbitgetGray(TrackbitChannel.Two) > 200
    three = CutebotPro.trackbitgetGray(TrackbitChannel.Three) > 200
    four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
    if (!one) {
        CutebotPro.pwmCruiseControl(0, adjust_speed)
        while (four) {
            control.waitMicros(100)
            four = CutebotPro.trackbitgetGray(TrackbitChannel.Four) > 200
        }
    } else if (!four) {
        CutebotPro.pwmCruiseControl(adjust_speed, 0)
        while (one) {
            control.waitMicros(100)
            one = CutebotPro.trackbitgetGray(TrackbitChannel.One) > 200
        }
    }
    
    CutebotPro.pwmCruiseControl(0, 0)
    //  Advance forward to the center of the current square
    CutebotPro.distanceRunning(CutebotProOrientation.Advance, 17, CutebotProDistanceUnits.Cm)
}

//  Broadcast the solution to another bot
function broadcast_solution() {
    let dx: number;
    let dy: number;
    
    //  For each direction traveled
    for (let i = 1; i < navigation.length; i++) {
        //  Find change in x or y
        dx = navigation[i][0] - navigation[i - 1][0]
        dy = navigation[i][1] - navigation[i - 1][1]
        //  Send corresponding direction of the move represented by the dx/dy
        if (dx == 1) {
            radio.sendNumber(0)
        } else if (dx == -1) {
            radio.sendNumber(2)
        } else if (dy == 1) {
            radio.sendNumber(1)
        } else {
            radio.sendNumber(3)
        }
        
    }
}

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

//  Get the
function get_surroundings(): boolean[] {
    let l: boolean;
    let f: boolean;
    let r: boolean;
    
    
    
    
    
    let toward_0 = inside([x + 1, y], vwalls)
    let toward_1 = inside([x, y + 1], hwalls)
    let toward_2 = inside([x, y], vwalls)
    let toward_3 = inside([x, y], hwalls)
    if (direction == 0) {
        l = toward_1
        f = toward_0
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
    
    return [l, r]
}

function move_block() {
    let obs_forward: any;
    let [obs_l, obs_r] = get_surroundings()
    //  Get the status of walls to the side for efficiency
    if (left) {
        //  If we are following the left side of the line
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
    //  Go until the magnet is found, following the left wall
    for (let i = 0; i < 5; i++) {
        move_block()
    }
    while (!magnet_found()) {
        move_block()
    }
}

//  Head back to the start
function navigate_back() {
    let next_step: number[];
    let dx: number;
    let dy: number;
    let goal_direction: number;
    let change_dir: number;
    optimize()
    //  Optimized navigation path
    broadcast_solution()
    let num_steps = navigation.length
    for (let step_num = 2; step_num < num_steps + 1; step_num++) {
        next_step = navigation[num_steps - step_num]
        dx = next_step[0] - x
        dy = next_step[1] - y
        if (dx == 1) {
            goal_direction = 0
        } else if (dy == 1) {
            goal_direction = 1
        } else if (dx == -1) {
            goal_direction = 2
        } else {
            goal_direction = 3
        }
        
        change_dir = goal_direction - direction
        if (change_dir == 1 || change_dir == -3) {
            turn_left()
        } else if (change_dir == 2 || change_dir == -2) {
            turn_180()
        } else if (change_dir == 3 || change_dir == -1) {
            turn_right()
        }
        
        if (dx != 0 || dy != 0) {
            forward()
        }
        
    }
}

// celebration!!
let rad = 0
let countdown = 3
// sprite swirls out from center
function swirlOut() {
    let x: number;
    let my_sprite = game.createSprite(2, 2)
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 2; j++) {
            for (x = 0; x < rad; x++) {
                my_sprite.move(1)
                basic.pause(20)
            }
            my_sprite.turn(Direction.Right, 90)
        }
        rad = rad + 1
    }
    for (x = 0; x < rad - 1; x++) {
        my_sprite.move(1)
        basic.pause(25)
    }
    my_sprite.delete()
}

// sprite swirls back in to center
function swirlIn() {
    let my_sprite = game.createSprite(0, 4)
    
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
    my_sprite.delete()
}

// repeats swirl "countdown" times and shows message
function celly() {
    for (let i = 0; i < countdown; i++) {
        basic.showNumber(countdown - i)
        swirlOut()
        swirlIn()
    }
    basic.showString("BOMB FOUND!")
}

function main() {
    radio.setGroup(7)
    radio.sendString("L")
    basic.showNumber(1)
    while (!magnet_found() || !CutebotPro.getGrayscaleSensorState(TrackbitStateType.Tracking_State_0)) {
        follow_line()
        control.waitMicros(1000)
    }
    CutebotPro.distanceRunning(CutebotProOrientation.Advance, 17, CutebotProDistanceUnits.Cm)
    radio.sendString("M")
    basic.showNumber(2)
    navigate_maze()
    celly()
    basic.showNumber(3)
    navigate_back()
    basic.showNumber(4)
}

main()
