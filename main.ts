let value: number;
//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
let leftSpeed = 20
let rightSpeed = 20
/** 
while True:
    CutebotPro.color_light(CutebotProRGBLight.RGBL, 0xffffff)
    CutebotPro.pwm_cruise_control(leftSpeed, rightSpeed)
    if CutebotPro.ultrasonic(SonarUnit.CENTIMETERS) < 20:
        CutebotPro.color_light(CutebotProRGBLight.RGBL, 0xff00ff)
        music.play(music.tone_playable(Note.G, music.beat(BeatFraction.HALF)), music.PlaybackMode.UNTIL_DONE)
        CutebotPro.stop_immediately(CutebotProMotors.M1)
        CutebotPro.pwm_cruise_control(-30, 30)
        control.wait_micros(450000)

 */
let baseline = Math.abs(input.magneticForce(Dimension.Y))
//  Take a baseline reading of magnetic strength
console.log(baseline)
control.waitMicros(3000000)
CutebotPro.pwmCruiseControl(leftSpeed, rightSpeed)
let mainrun = true
while (mainrun) {
    // continually takes magnetic vals
    value = Math.abs(input.magneticForce(Dimension.Y))
    console.log(value)
    // if magnet is detected
    if (Math.abs(value - baseline) > 30) {
        console.log("True")
        // display X
        basic.showIcon(IconNames.No)
        // stop bot
        CutebotPro.stopImmediately(CutebotProMotors.ALL)
        control.waitMicros(2000000)
        // initialize wheel rotation to zero
        CutebotPro.clearWheelTurn(CutebotProMotors1.M1)
        // spin robot around
        CutebotPro.trolleySteering(CutebotProTurn.LeftInPlace, 180)
        CutebotPro.pwmCruiseControl(leftSpeed, rightSpeed)
        control.waitMicros(100000)
    }
    
    basic.showIcon(IconNames.Yes)
}
