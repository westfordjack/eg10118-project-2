# EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
# Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman

straight_speed = 20 # Nominal speed of the robot
left = True # Does the robot hug the left or right side of the line
turn = 90 # This number should represent a right turn

# Navigation parameters
navigation = [(0,0)]
direction = 0 # 0 = East, 1 = North, 2 = West, 3 = South
x = navigation[0][0]
y = navigation[0][1]

# Setting block size and radio stuff
CutebotPro.set_block_cnt(12, CutebotProDistanceUnits.FT)
radio.set_group(1)

# Magnetic baseline and threshold
baseline = abs(input.magnetic_force(Dimension.Y))
magnetic_threshold = 50 #in microteslas

# Function to check if a magnet has been found
def magnet_found():
    return abs(input.magnetic_force(Dimension.Y)) - baseline > magnetic_threshold

# Set the robot to go tangent to the current edge of the line
def follow_line():
    # Get distance from line (+3000 to -3000)
    offset = CutebotPro.get_offset()

    # If we want to follow the left side of the line, center ourselves at offset 1500
    if left:
        difference = offset - 1500
        difference = difference if difference > -1500 else -1500
    # If we want to follow the right side of the line, center ourselves at offset -1500
    else:
        difference = offset + 1500
        difference = difference if difference < 1500 else 1500

    # Difference ranges from +1500 to -1500, tells how far from target

    # If we have the line at all, scale turning speed with distance from line
    if abs(difference) != 1500:
        turn_speed = straight_speed - (abs(difference) / 1500) * straight_speed
    # If we lost the line, set turn speed to spin in a circle
    else:
        turn_speed = -straight_speed

    # Turn left or right based on which side of target we are on
    if difference > 0:
        CutebotPro.pwm_cruise_control(straight_speed, turn_speed)
    else:
        CutebotPro.pwm_cruise_control(turn_speed, straight_speed)

# Turning functions
def turn_right():
    global direction
    CutebotPro.trolley_steering(CutebotProTurn.RIGHT_IN_PLACE, turn)
    direction = (direction - 1) % 4

def turn_left():
    global direction
    CutebotPro.trolley_steering(CutebotProTurn.LEFT_IN_PLACE, turn)
    direction = (direction + 1) % 4

def turn_180():
    global direction
    CutebotPro.trolley_steering(CutebotProTurn.LEFT_IN_PLACE, turn * 2)
    direction = (direction + 2) % 4

# Checks for an obstacle
def obstacle():
    return CutebotPro.ultrasonic(SonarUnit.INCHES) < 6

# Move forward, updating direction
def forward():
    global x
    global y
    global direction
    if direction == 0:
        x += 1
    elif direction == 1:
        y += 1
    elif direction == 2:
        x -= 1
    else:
        y -= 1
    navigation.append((x, y))
    CutebotPro.run_block_cnt(1)

# Broadcast the solution to another bot
def broadcast_solution():
    pass

# Navigate the maze
def navigate_maze():
    global x
    global y
    # Go until the magnet is found, following the left wall
    while not magnet_found():
        obs_forward = obstacle()
        turn_left()
        if not obstacle():
            forward()
        elif not obs_forward:
            turn_right()
            forward()
        else:
            turn_180()
            if not obstacle():
                forward()
            else:
                turn_right()
                forward()

# Head back to the start
def navigate_back():
    global navigation
    global x
    global y
    global direction
    num_steps = len(navigation)
    for step_num in range(1, num_steps + 1):
        next_step = navigation[num_steps - step_num]
        dx = next_step[0] - x
        dy = next_step[1] - y

        if dx == 1:
            goal_direction = 0
        elif dy == 1:
            goal_direction = 1
        elif dx == -1:
            goal_direction = 2
        else:
            goal_direction = 3

        change_dir = (goal_direction - direction) % 4
        if change_dir == 1:
            turn_left()
        elif change_dir == 2:
            turn_180()
        elif change_dir == 3:
            turn_right()

        forward()

def main():
    basic.show_number(1)
    while not magnet_found():
        follow_line()
        control.wait_micros(1000)
    basic.show_number(2)
    navigate_maze()
    basic.show_number(3)
    broadcast_solution()
    navigate_back()
    basic.show_number(4)

main()