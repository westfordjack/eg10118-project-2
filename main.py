# EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
# Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
radio.set_group(7)

adjust_speed = 12
straight_speed = 20 # Nominal speed of the robot
left = True # Does the robot hug the left or right side of the line
turn = 92 # This number should represent a right turn

def red():
    def onIn_background():
        for i in range(3):
            CutebotPro.color_light(CutebotProRGBLight.RGBL, 0xff0000)
            basic.pause(500)
            CutebotPro.turn_off_all_headlights()
        basic.pause(500)
    control.in_background(onIn_background)
    
def green():
    def onIn_background():
        for i in range(3):
            CutebotPro.color_light(CutebotProRGBLight.RGBL, 0x00ff00)
            basic.pause(500)
            CutebotPro.turn_off_all_headlights()
        basic.pause(500)
    control.in_background(onIn_background)

def blue():
    def onIn_background():
        for i in range(3):
            CutebotPro.color_light(CutebotProRGBLight.RGBL, 0x0000ff)
            basic.pause(500)
            CutebotPro.turn_off_all_headlights()
        basic.pause(500)
    control.in_background(onIn_background)

def yellow():
    def onIn_background():
        for i in range(3):
            CutebotPro.color_light(CutebotProRGBLight.RGBL, 0xffff00)
            basic.pause(500)
            CutebotPro.turn_off_all_headlights()
        basic.pause(500)
    control.in_background(onIn_background)
    
# when a button is pressed it changes the side the bot follows
if input.button_is_pressed(Button.A):
    left = True
if input.button_is_pressed(Button.B):
    left = False

# Navigation parameters
navigation = [[0, 0]]
direction = 0 # 0 = East, 1 = North, 2 = West, 3 = South
x = navigation[0][0]
y = navigation[0][1]

# Wall finding efficiency
hwalls = [[0, 0]]
vwalls = [[0, 0]]
hwalls.clear() # Clear to avoid TypeScript type errors
vwalls.clear()

# Magnetic baseline and threshold
baseline = abs(input.magnetic_force(Dimension.Z))
magnetic_threshold = 100 # in microteslas

# Function to check if a magnet has been found
def magnet_found():
    return abs(input.magnetic_force(Dimension.Z)) - baseline > magnetic_threshold

# Set the robot to go tangent to the current edge of the line
def follow_line():
    global straight_speed

    # Get offset from line (+3000 to -3000)
    offset = CutebotPro.get_offset()

    # If we want to follow the left side of the line, center ourselves at offset 1500
    if left:
        difference = offset - 1500
        difference = difference if difference > -1500 else -1500
    else:
        # If we want to follow the right side of the line, center ourselves at offset -1500
        difference = offset + 1500
        difference = difference if difference < 1500 else 1500
    
    # Difference ranges from +1500 to -1500, tells how far from target
    # If we have the line at all, scale turning speed with distance from line
    if abs(difference) != 1500:
        turn_speed = straight_speed - abs(difference) / 1500 * straight_speed
    else:
        # If we lost the line, set turn speed to spin in a circle
        turn_speed = -straight_speed

    # Turn left or right based on which side of target we are on
    if difference > 0:
        CutebotPro.pwm_cruise_control(straight_speed, turn_speed)
    else:
        CutebotPro.pwm_cruise_control(turn_speed, straight_speed)

# Turning functions
def turn_right():
    global direction
    # Turn right
    CutebotPro.pwm_cruise_control(0, 0)
    CutebotPro.trolley_steering(CutebotProTurn.RIGHT_IN_PLACE, turn)
    # Update direction, make sure rollover is ok
    direction = direction - 1
    if direction < 0:
        direction += 4
    
def turn_left():
    global direction
    # Turn left
    CutebotPro.pwm_cruise_control(0, 0)
    CutebotPro.trolley_steering(CutebotProTurn.LEFT_IN_PLACE, turn)
    # Update direction, make sure rollover is ok
    direction = (direction + 1) % 4

def turn_180():
    global direction
    # Turn 180 degrees in place
    CutebotPro.trolley_steering(CutebotProTurn.LEFT_IN_PLACE, turn * 2)
    # Update directrion
    direction = (direction + 2) % 4

# Checks for an obstacle
def obstacle():
    obstacle_there = CutebotPro.ultrasonic(SonarUnit.INCHES) < 6
    # If there is an obstacle, record its location in the proper array (for vertical or horizontal walls)
    if obstacle_there:
        if direction == 0:
            vwalls.append([x + 1, y])
        elif direction == 1:
            hwalls.append([x, y + 1])
        elif direction == 2:
            vwalls.append([x, y])
        else:
            hwalls.append([x, y])
    # Return whether or not an obstacle was found
    return obstacle_there

# Move forward, updating direction
def forward():
    global x, y
    global straight_speed

    # Update position coordinates
    if direction == 0:
        x += 1
    elif direction == 1:
        y += 1
    elif direction == 2:
        x -= 1
    else:
        y -= 1

    # Add new position to the list of seen points
    navigation.append([x, y])
    
    # Record whether or not each sensor sees white
    one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) < 200
    two = CutebotPro.trackbitget_gray(TrackbitChannel.TWO) < 200
    three = CutebotPro.trackbitget_gray(TrackbitChannel.THREE) < 200
    four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) < 200

    # Drive forward until we see the tape
    CutebotPro.pwm_cruise_control(adjust_speed, adjust_speed)
    while one and two and three and four:
        control.wait_micros(100)
        one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) < 200
        two = CutebotPro.trackbitget_gray(TrackbitChannel.TWO) < 200
        three = CutebotPro.trackbitget_gray(TrackbitChannel.THREE) < 200
        four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) < 200

    # Stop on the tape
    CutebotPro.pwm_cruise_control(0, 0)
    one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) < 200
    two = CutebotPro.trackbitget_gray(TrackbitChannel.TWO) < 200
    three = CutebotPro.trackbitget_gray(TrackbitChannel.THREE) < 200
    four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) < 200

    # Turn right if only the left sensor sees the tape
    if not one:
        CutebotPro.pwm_cruise_control(0, adjust_speed)
        while four:
            control.wait_micros(100)
            four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) < 200

    # Turn left if only the right sensor sees the tape
    elif not four:
        CutebotPro.pwm_cruise_control(adjust_speed, 0)
        while one:
            control.wait_micros(100)
            one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) < 200

    ## Repeat the same process, but for leaving the tape
    CutebotPro.pwm_cruise_control(0, 0)

    one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) > 200
    two = CutebotPro.trackbitget_gray(TrackbitChannel.TWO) > 200
    three = CutebotPro.trackbitget_gray(TrackbitChannel.THREE) > 200
    four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) > 200

    CutebotPro.pwm_cruise_control(adjust_speed, adjust_speed)

    while one and two and three and four:
        control.wait_micros(100)
        one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) > 200
        two = CutebotPro.trackbitget_gray(TrackbitChannel.TWO) > 200
        three = CutebotPro.trackbitget_gray(TrackbitChannel.THREE) > 200
        four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) > 200

    CutebotPro.pwm_cruise_control(0, 0)
    one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) > 200
    two = CutebotPro.trackbitget_gray(TrackbitChannel.TWO) > 200
    three = CutebotPro.trackbitget_gray(TrackbitChannel.THREE) > 200
    four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) > 200

    if not one:
        CutebotPro.pwm_cruise_control(0, adjust_speed)
        while four:
            control.wait_micros(100)
            four = CutebotPro.trackbitget_gray(TrackbitChannel.FOUR) > 200
    elif not four:
        CutebotPro.pwm_cruise_control(adjust_speed, 0)
        while one:
            control.wait_micros(100)
            one = CutebotPro.trackbitget_gray(TrackbitChannel.ONE) > 200

    CutebotPro.pwm_cruise_control(0, 0)

    # Advance forward to the center of the current square
    CutebotPro.distance_running(CutebotProOrientation.ADVANCE, 17, CutebotProDistanceUnits.CM)



# Broadcast the solution to another bot
def broadcast_solution():
    global navigation
    # For each direction traveled
    for i in range(1, len(navigation)):
        # Find change in x or y
        dx = navigation[i][0] - navigation[i - 1][0]
        dy = navigation[i][1] - navigation[i - 1][1]
        # Send corresponding direction of the move represented by the dx/dy
        if (dx == 1):
            radio.send_number(0)
        elif (dx == -1):
            radio.send_number(2)
        elif (dy == 1):
            radio.send_number(1)
        else:
            radio.send_number(3)


# Optimize return solution
def optimize():
    # Optimize by removing hanging areas
    global navigation

    # Create a copy of navigation
    optimized = navigation[:]
    
    # Loop through navigation
    cur_icoord = 0
    while cur_icoord < len(optimized) - 1:
        last_icoord = len(optimized) - 1
        # Loop through all spots ahead of this one
        while last_icoord > cur_icoord:
            # if the spots are the same
            if optimized[cur_icoord][0] == optimized[last_icoord][0] and optimized[cur_icoord][1] == optimized[last_icoord][1]:
                # Delete all moves in between
                i = last_icoord
                while i > cur_icoord:
                    optimized.pop(i)
                    i += -1
                last_icoord = cur_icoord
            else:
                last_icoord -= 1
    
        cur_icoord += 1

    # Set navigation list to this optimized one
    navigation = optimized

# Checks if a 2d value is in a list
def inside(goal: List[number], container: List[List[number]]): # Type declarations are needed because this is actually typescript in a python-shaped costume
    # Loop through list
    for val in container:
        # If found, return true
        if goal[0] == val[0] and goal[1] == val[1]:
            return True
    # Not found; return false
    return False

# Get the
def get_surroundings():
    global x
    global y
    global direction
    global hwalls
    global vwalls

    toward_0 = inside([x + 1, y], vwalls)
    toward_1 = inside([x, y + 1], hwalls)
    toward_2 = inside([x, y], vwalls)
    toward_3 = inside([x, y], hwalls)


    if direction == 0:
        l = toward_1
        f = toward_0
        r = toward_3
    elif direction == 1:
        l = toward_2
        r = toward_0
    elif direction == 2:
        l = toward_3
        r = toward_1
    else:
        l = toward_0
        r = toward_2

    return l, r

def move_block():
    obs_l, obs_r = get_surroundings() # Get the status of walls to the side for efficiency
    if left: # If we are following the left side of the line
        obs_forward = obstacle() # Check if there is an obstacle in front
        if not obs_l: # If there's no saved wall to the left
            # Turn left--if no obstacle, go forward
            turn_left()
            if not obstacle():
                forward()
            # Otherwise, if no obstacle was in front, turn back and go
            elif not obs_forward:
                turn_right()
                forward()
            # Otherwise, if there's no saved wall to the right, turn around and check
            elif not obs_r:
                turn_180()
                # If there's no obstacle, go
                if not obstacle():
                    forward()
                # Otherwise, turn around and go back
                else:
                    turn_right()
                    forward()
            # If there was a saved wall to the right, turn back
            else:
                turn_left()
                forward()
        else:
            # If there was a saved wall to the left, go forward if possible
            if not obs_forward:
                forward()
            # Otherwise, if there's no saved wall to the right, go check
            elif not obs_r:
                turn_right()
                # If no obstacle, go; otherwise, turn back
                if not obstacle():
                    forward()
                else:
                    turn_right()
                    forward()
            # If there was a saved wall to the right, turn back
            else:
                turn_180()
                forward()
        
    else: # If we're following the right wall
        obs_forward = obstacle() # Check if there is an obstacle in front
        if not obs_r: # If there's no saved wall to the right
            # Turn right--if no obstacle, go forward
            turn_right()
            if not obstacle():
                forward()
            # Otherwise, if no obstacle was in front, turn back and go
            elif not obs_forward:
                turn_left()
                forward()
            # Otherwise, if there's no saved wall to the left, turn around and check
            elif not obs_l:
                turn_180()
                # If there's no obstacle, go
                if not obstacle():
                    forward()
                # Otherwise, turn around and go back
                else:
                    turn_left()
                    forward()
            # If there was a saved wall to the right, turn back
            else:
                turn_right()
                forward()
        else:
            # If there was a saved wall to the right, go forward if possible
            if not obs_forward:
                forward()
            # Otherwise, if there's no saved wall to the left, go check
            elif not obs_l:
                turn_left()
                # If no obstacle, go; otherwise, turn back
                if not obstacle():
                    forward()
                else:
                    turn_left()
                    forward()
            # If there was a saved wall to the left, turn back
            else:
                turn_180()
                forward()

# Navigate the maze
def navigate_maze():
    # Go until the magnet is found, following the left wall
    for i in range(5):
        move_block()
    while not magnet_found():
        move_block()
        

# Head back to the start
def navigate_back():
    optimize()
    # Optimized navigation path
    broadcast_solution()
    num_steps = len(navigation)
    for step_num in range(2, num_steps + 1):
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
        change_dir = goal_direction - direction
        if change_dir == 1 or change_dir == -3:
            turn_left()
        elif change_dir == 2 or change_dir == -2:
            turn_180()
        elif change_dir == 3 or change_dir == -1:
            turn_right()
        if dx != 0 or dy != 0:
            forward()

#celebration!!
rad = 0
countdown = 3

#sprite swirls out from center
def swirlOut():
    my_sprite = game.create_sprite(2, 2)
    global rad
    for i in range(5):
        for j in range(2):
            for x in range(rad):
                my_sprite.move(1)
                basic.pause(20)
            my_sprite.turn(Direction.RIGHT, 90)
        rad = rad+1
    for x in range(rad-1):
        my_sprite.move(1)
        basic.pause(25)
    my_sprite.delete()

#sprite swirls back in to center
def swirlIn():
    my_sprite = game.create_sprite(0, 4)
    global rad

    my_sprite.turn(Direction.LEFT, 90)
    for i in range(5):
        for j in range(2):
            for x in range(rad):
                my_sprite.move(1)
                basic.pause(20)
            my_sprite.turn(Direction.LEFT, 90)
        rad -= 1
    my_sprite.delete()

#repeats swirl "countdown" times and shows message
def celly():
    for i in range(countdown):
        basic.show_number(countdown-i)
        swirlOut()
        swirlIn()
    basic.show_string("BOMB FOUND!")

def main():
    radio.set_group(7)
    radio.send_string("L")
    basic.show_number(1)
    while (not magnet_found()) or (not CutebotPro.get_grayscale_sensor_state(TrackbitStateType.TRACKING_STATE_0)):
        follow_line()
        control.wait_micros(1000)
    CutebotPro.distance_running(CutebotProOrientation.ADVANCE, 17, CutebotProDistanceUnits.CM)
    radio.send_string("M")
    basic.show_number(2)
    navigate_maze()
    celly()
    basic.show_number(3)
    navigate_back()
    basic.show_number(4)



main()