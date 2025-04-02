# EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
# Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman

leftSpeed = 30
rightSpeed = 30


'''
while True:
    CutebotPro.color_light(CutebotProRGBLight.RGBL, 0xffffff)
    CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)
    if CutebotPro.ultrasonic(SonarUnit.CENTIMETERS) < 20:
        CutebotPro.color_light(CutebotProRGBLight.RGBL, 0xff00ff)
        music.play(music.tone_playable(Note.G, music.beat(BeatFraction.HALF)), music.PlaybackMode.UNTIL_DONE)
        CutebotPro.stop_immediately(CutebotProMotors.M1)
        CutebotPro.pwm_cruise_control(-30, 30)
        control.wait_micros(450000)
'''

baseline = abs(input.magnetic_force(Dimension.X)) # Take a baseline reading of magnetic strength
control.wait_micros(3000000)

CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)
logic = True

while logic:
    value = abs(input.magnetic_force(Dimension.Y))

    if abs(value - baseline) > 30:
        basic.show_icon(IconNames.NO)
        CutebotPro.full_astern()
        CutebotPro.stop_immediately(CutebotProMotors.ALL)
        
        CutebotPro.clear_wheel_turn(CutebotProMotors1.M1)
        #CutebotPro.clear_wheel_turn(CutebotProMotors1.M2)

        CutebotPro.pwm_cruise_control(leftSpeed, -rightSpeed)
        
        while logic:
            angle1 = CutebotPro.read_distance(CutebotProMotors1.M1)
           # angle2 = CutebotPro.read_distance(CutebotProMotors1.M2)
           # angle3 = (angle1+angle2)/2

            if angle1 > 400:
                CutebotPro.stop_immediately(CutebotProMotors.ALL)
                logic = False


    basic.show_icon(IconNames.YES)
    CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)