import React from 'react';
import Avatar from '@material-ui/core/Avatar';

import avatarAxolotl from '../images/avatars/avatar-axolotl.svg';
import avatarCardinal from '../images/avatars/avatar-cardinal.svg';
import avatarFox from '../images/avatars/avatar-fox.svg';
import avatarHedgehog from '../images/avatars/avatar-hedgehog.svg';
import avatarLizard from '../images/avatars/avatar-lizard.svg';
import avatarMole from '../images/avatars/avatar-mole.svg';
import avatarMouse from '../images/avatars/avatar-mouse.svg';
import avatarOtter from '../images/avatars/avatar-otter.svg';
import avatarOwl from '../images/avatars/avatar-owl.svg';
import avatarPlatypus from '../images/avatars/avatar-platypus.svg';
import avatarRat from '../images/avatars/avatar-rat.svg';
import avatarSquirrel from '../images/avatars/avatar-squirrel.svg';
import avatarStarling from '../images/avatars/avatar-starling.svg';
import avatarToad from '../images/avatars/avatar-toad.svg';
import avatarTurtle from '../images/avatars/avatar-turtle.svg';
import avatarUnknown from '../images/avatars/avatar-unknown.svg';

const getAvatarImageSource = (avatar) => {
  switch (avatar) {
    case 'axolotl':
      return avatarAxolotl;
    case 'cardinal':
      return avatarCardinal;
    case 'fox':
      return avatarFox;
    case 'hedgehog':
      return avatarHedgehog;
    case 'lizard':
      return avatarLizard;
    case 'mole':
      return avatarMole;
    case 'mouse':
      return avatarMouse;
    case 'otter':
      return avatarOtter;
    case 'owl':
      return avatarOwl;
    case 'platypus':
      return avatarPlatypus;
    case 'rat':
      return avatarRat;
    case 'squirrel':
      return avatarSquirrel;
    case 'starling':
      return avatarStarling;
    case 'toad':
      return avatarToad;
    case 'turtle':
      return avatarTurtle;
    default:
      return avatarUnknown;
  }
};

const PlayerAvatar = ({ avatar }) => {
  return <Avatar alt={avatar} src={getAvatarImageSource(avatar)} />;
};

export default PlayerAvatar;
