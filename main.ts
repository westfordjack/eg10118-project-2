let value: number;
let angle1: number;
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
let baseline = Math.abs(input.magneticForce(Dimension.X))
//  Take a baseline reading of magnetic strength
control.waitMicros(3000000)
CutebotPro.pwmCruiseControl(leftSpeed, rightSpeed)
let logic = true
while (logic) {
    value = Math.abs(input.magneticForce(Dimension.Y))
    if (Math.abs(value - baseline) > 30) {
        basic.showIcon(IconNames.No)
        CutebotPro.fullAstern()
        CutebotPro.stopImmediately(CutebotProMotors.ALL)
        CutebotPro.clearWheelTurn(CutebotProMotors1.M1)
        // CutebotPro.clear_wheel_turn(CutebotProMotors1.M2)
        CutebotPro.pwmCruiseControl(leftSpeed, -rightSpeed)
        while (logic) {
            angle1 = CutebotPro.readDistance(CutebotProMotors1.M1)
            //  angle2 = CutebotPro.read_distance(CutebotProMotors1.M2)
            //  angle3 = (angle1+angle2)/2
            if (angle1 > 400) {
                CutebotPro.stopImmediately(CutebotProMotors.ALL)
                logic = false
            }
            
        }
    }
    
    basic.showIcon(IconNames.Yes)
    CutebotPro.pwmCruiseControl(leftSpeed, rightSpeed)
}
