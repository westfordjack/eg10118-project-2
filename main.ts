//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
let leftSpeed = 30
let rightSpeed = 30
while (true) {
    CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0xffffff)
    CutebotPro.pwmCruiseControl(leftSpeed, rightSpeed)
    if (CutebotPro.ultrasonic(SonarUnit.Centimeters) < 20) {
        CutebotPro.colorLight(CutebotProRGBLight.RGBL, 0xff00ff)
        music.play(music.tonePlayable(Note.G, music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
        CutebotPro.stopImmediately(CutebotProMotors.M1)
        CutebotPro.pwmCruiseControl(-30, 30)
        control.waitMicros(450000)
    }
    
}
