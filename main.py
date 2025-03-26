# EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
# Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman

leftSpeed = 50
rightSpeed = 50



while True:
    CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)

    if CutebotPro.ultrasonic(SonarUnit.CENTIMETERS) < 10:

        CutebotPro.stop_immediately(CutebotProMotors.M1)
        music.play(music.tone_playable(Note.G, music.beat(BeatFraction.HALF)), music.PlaybackMode.UNTIL_DONE)
        CutebotPro.trolley_steering(CutebotProTurn.LEFT, 180)