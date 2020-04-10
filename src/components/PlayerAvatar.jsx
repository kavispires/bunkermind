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

const AVATAR_IMAGE_SOURCE = {
  axolotl: avatarAxolotl,
  cardinal: avatarCardinal,
  fox: avatarFox,
  hedgehog: avatarHedgehog,
  lizard: avatarLizard,
  mole: avatarMole,
  mouse: avatarMouse,
  otter: avatarOtter,
  owl: avatarOwl,
  platypus: avatarPlatypus,
  rat: avatarRat,
  squirrel: avatarSquirrel,
  starling: avatarStarling,
  toad: avatarToad,
  turtle: avatarTurtle,
};

const PlayerAvatar = ({ avatar }) => {
  return <Avatar alt={avatar} src={AVATAR_IMAGE_SOURCE[avatar] || avatarUnknown} />;
};

export default PlayerAvatar;
