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

baseline = input.magnetic_force(Dimension.X) # Take a baseline reading of magnetic strength
print(baseline)
control.wait_micros(1000000)

while True:
    value = input.magnetic_force(Dimension.Y)
    print(value)

    if abs(value - baseline) > 50:
        basic.show_icon(IconNames.NO)  
          # Show a cross symbol
    else:
        basic.clear_screen()
    
    control.wait_micros(25000)