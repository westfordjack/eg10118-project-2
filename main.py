# EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
# Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman

leftSpeed = 20
rightSpeed = 20


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

baseline = abs(input.magnetic_force(Dimension.Y)) # Take a baseline reading of magnetic strength
print(baseline)
control.wait_micros(3000000)

CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)

mainrun = True

while mainrun:
    #continually takes magnetic vals
    value = abs(input.magnetic_force(Dimension.Y))
    print(value)

    #if magnet is detected
    if abs(value - baseline) > 30:
        print("True")
        #display X
        basic.show_icon(IconNames.NO)
        
        #stop bot
        CutebotPro.stop_immediately(CutebotProMotors.ALL)
        control.wait_micros(2000000)
        
        #initialize wheel rotation to zero
        CutebotPro.clear_wheel_turn(CutebotProMotors1.M1)

        #spin robot around
        CutebotPro.trolley_steering(CutebotProTurn.LEFT_IN_PLACE, 180)
        
        CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)
        control.wait_micros(100000)


    basic.show_icon(IconNames.YES)