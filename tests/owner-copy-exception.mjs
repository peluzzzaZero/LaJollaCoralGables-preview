// The owners' own copy for the venue walk (v1.27.2) names the main room "The Grand Ballroom".
// Dan approved this one exception on 2026-10-20 (project thread message
// cmsg_01GL3PKKV8ocyFb2wddJ4DhK6jvPfcSwYHksXrU8H2Bm1H): their text goes on the site as they sent it.
// The banned-word checks stay in force everywhere else; only these exact strings are allowed:
// the same three strings in script.js (EN dictionary) and index.html (EN defaults), and their
// faithful Spanish translation in script.js.
export const OWNER_ROOM_NAME_STRINGS = [
  '"visit.walkHall": "The Grand Ballroom"',
  '"visit.noteHallKicker": "II · The Grand Ballroom"',
  '"visit.hall": "The Grand Ballroom · A timeless setting for unforgettable occasions."',
  'data-i18n="visit.walkHall">The Grand Ballroom<',
  'data-i18n="visit.noteHallKicker">II · The Grand Ballroom<',
  'data-i18n="visit.hall">The Grand Ballroom · A timeless setting for unforgettable occasions.<',
  '"visit.walkHall": "El Gran Salón de Baile"',
  '"visit.noteHallKicker": "II · El Gran Salón de Baile"',
  '"visit.hall": "El Gran Salón de Baile · Un entorno atemporal para ocasiones inolvidables."',
];

// English and Spanish forms of the banned word.
export const BANNED_ROOM_WORD = /ballroom|sal[oó]n de baile/i;

export function withoutOwnerRoomName(text) {
  return OWNER_ROOM_NAME_STRINGS.reduce((rest, allowed) => rest.split(allowed).join(""), text);
}
