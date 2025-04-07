//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
let straight_speed = 20
//  Nominal speed of the robot
let left = true
//  Does the robot hug the left or right side of the line
let turn = 90
//  This number should represent a right turn
//  Navigation parameters
let navigation = [[0, 0]]
let direction = 0
//  0 = East, 1 = North, 2 = West, 3 = South
let x = navigation[0][0]
let y = navigation[0][1]
//  Setting block size and radio stuff
CutebotPro.setBlockCnt(12, CutebotProDistanceUnits.Ft)
radio.setGroup(1)
//  Magnetic baseline and threshold
let baseline = Math.abs(input.magneticForce(Dimension.Y))
let magnetic_threshold = 50
// in microteslas
//  Function to check if a magnet has been found
function magnet_found() {
    return Math.abs(input.magneticForce(Dimension.Y)) - baseline > magnetic_threshold
}

//  Set the robot to go tangent to the current edge of the line
function follow_line() {
    let difference: number;
    let turn_speed: number;
    //  Get distance from line (+3000 to -3000)
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
    
    CutebotPro.trolleySteering(CutebotProTurn.RightInPlace, turn)
    direction = (direction - 1) % 4
}

function turn_left() {
    
    CutebotPro.trolleySteering(CutebotProTurn.LeftInPlace, turn)
    direction = (direction + 1) % 4
}

function turn_180() {
    
    CutebotPro.trolleySteering(CutebotProTurn.LeftInPlace, turn * 2)
    direction = (direction + 2) % 4
}

//  Checks for an obstacle
function obstacle() {
    return CutebotPro.ultrasonic(SonarUnit.Inches) < 6
}

//  Move forward, updating direction
function forward() {
    
    
    
    if (direction == 0) {
        x += 1
    } else if (direction == 1) {
        y += 1
    } else if (direction == 2) {
        x -= 1
    } else {
        y -= 1
    }
    
    navigation.push([x, y])
    CutebotPro.runBlockCnt(1)
}

//  Broadcast the solution to another bot
function broadcast_solution() {
    
}

//  Navigate the maze
function navigate_maze() {
    let obs_forward: any;
    
    
    //  Go until the magnet is found, following the left wall
    while (!magnet_found()) {
        obs_forward = obstacle()
        turn_left()
        if (!obstacle()) {
            forward()
        } else if (!obs_forward) {
            turn_right()
            forward()
        } else {
            turn_180()
            if (!obstacle()) {
                forward()
            } else {
                turn_right()
                forward()
            }
            
        }
        
    }
}

//  Head back to the start
function navigate_back() {
    let next_step: number[];
    let dx: number;
    let dy: number;
    let goal_direction: number;
    let change_dir: any;
    
    
    
    
    let num_steps = navigation.length
    for (let step_num = 1; step_num < num_steps + 1; step_num++) {
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
        
        change_dir = (goal_direction - direction) % 4
        if (change_dir == 1) {
            turn_left()
        } else if (change_dir == 2) {
            turn_180()
        } else if (change_dir == 3) {
            turn_right()
        }
        
        forward()
    }
}

function main() {
    basic.showNumber(1)
    while (!magnet_found()) {
        follow_line()
        control.waitMicros(1000)
    }
    basic.showNumber(2)
    navigate_maze()
    basic.showNumber(3)
    broadcast_solution()
    navigate_back()
    basic.showNumber(4)
}

main()
