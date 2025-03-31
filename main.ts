let value: number;
//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
let leftSpeed = 30
let rightSpeed = 30
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
let baseline = input.magneticForce(Dimension.X)
//  Take a baseline reading of magnetic strength
console.log(baseline)
control.waitMicros(10000000)
while (true) {
    value = input.magneticForce(Dimension.X)
    console.log(value)
    if (Math.abs(value - baseline) > 30) {
        basic.showIcon(IconNames.No)
    } else {
        //  Show a cross symbol
        basic.clearScreen()
    }
    
    control.waitMicros(50000)
}
