export type MascotAnimationState =
  | 'hidden'
  | 'walking-in'
  | 'prompting'
  | 'walking-out-happy'
  | 'walking-out-snoozed';

export type MascotMood = 'neutral' | 'happy' | 'disappointed' | 'drinking';

export interface MascotPromptAction {
  onDrank: () => void;
  onSnooze: () => void;
}
