'use strict';

/**
 * 일단 HSL을 HEX로 변환하는 코드를 이해하려면, HSL이 뭔지를 알아야 함.
 * HSL 색상값은 빛의 삼원색으로 색을 표현하는 RGB 색상값과는 달리 
 * 색상(Hue), 채도(Saturation), 명도(Lightness)를 사용해서 색을 표현함.
 * 
 * -색상(Hue) 
 * 0부터 360 사이의 값을 가지며, 색상환(color wheel)의 각도를 나타냄.
 * 각도가 0 또는 360이면 빨간색(red)이 되며, 120이면 녹색(green), 240이면 파란색(blue)
 * 
 * -채도(Saturation)
 * 0%부터 100% 사이의 값을 가지며, 색상의 연하고 짙은 정도를 나타냄.
 * 채도 값이 0%면 회색이 되고, 100%면 원래 색상이 됨.
 * 
 * -명도(Lightness)
 * 0%부터 100% 사이의 값을 가지며, 색상의 밝고 어두운 정도를 나타냄.
 * 0%면 검정색이 되고, 50%면 원래 색상, 100%면 흰색이 됨.
 * 
 * 내 생각에는 생성되는 particle들의 색상값만 다르게 하면서 명도, 채도를 맞춰주기 위해서
 * HSL로 색상을 지정하려고 했던 것 같음.
 * 그러다보니 HSL을 rgb값, 또는 hex값으로 변환해줘야 각 particle들의 fillStyle에 할당해줄 수 있는거고...
 * 
 * <Javascript HSL to RGB로 색상값 변환하기> 북마크 한 부분 참고.
 * 똑같이 작성된 코드가 그대로 나와있음. 설명도 자세하게 되어있으니 읽어볼 것.
 * 아마 여기에 작성된 소스코드를 이용한 것 같음. 이 사람도 구글링해서 복붙하는구나...
 */

export function hslToHex(h, s, l) {
  // s, l(채도, 명도)는 원래 0% ~ 100%의 값이므로 100으로 나눠 퍼센트 단위로 바꿔준 것.
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s; // 다음으로 색도(color intensity)값을 계산하는 공식이라 함.
  let x = c * (1 - Math.abs((h / 60) % 2 - 1)); // 색도 다음으로 두번째로 큰 성분을 계산한 거라는데..?
  let m = l - c / 2; // 각 r,g,b 채널에 더해줘서 명도값을 match해주려는 값이라고 함.

  // r, g, b값들을 각각 초기화하고
  let red = 0;
  let green = 0;
  let blue = 0;

  // Hue값은 색상 휠 상에서 60도 단위의 섹터에 따라 red, green, blue의 값을 뭐로 해줘야 할 지 결정해 줌.
  if (0 <= h && h < 60) {
    red = c;
    green = x;
    blue = 0;
  } else if (60 <= h && h < 120) {
    red = x;
    green = c;
    blue = 0;
  } else if (120 <= h && h < 180) {
    red = 0;
    green = c;
    blue = x;
  } else if (180 <= h && h < 240) {
    red = 0;
    green = x;
    blue = c;
  } else if (240 <= h && h < 300) {
    red = x;
    green = 0;
    blue = c;
  } else if (300 <= h && h < 360) {
    red = c;
    green = 0;
    blue = x;
  }
  // 이런 식으로 하나의 채널만 0으로 남기고 나머지에는 각각 c, x를 할당해줌.

  // 최종 RGB 값을 얻으려면 m값을 각각 더해주고 255롤 곱해줘야 명도가 맞춰진 red, green, blue값이 나온다고 함.
  red = red + m;
  green = green + m;
  blue = blue + m;

  // 비트 OR 연산자를 이용해 소수점을 포함한 값을 정수로 변환해주는 것
  return `rgb(${red * 255 | 0},  ${green * 255 | 0}, ${blue * 255 | 0})`;
}