import type { ArgsStoryFn, StoryContext as DefaultStoryContext } from '@storybook/types';
// eslint-disable-next-line import/no-cycle
import { parameters } from './config';

export type { RenderContext } from '@storybook/types';

export type StoryFnHtmlReturnType = string | Node;

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export type HtmlFramework = {
  component: string | HTMLElement | ArgsStoryFn<HtmlFramework>;
  storyResult: StoryFnHtmlReturnType;
};

export type StoryContext = DefaultStoryContext<HtmlFramework> & {
  parameters: DefaultStoryContext<HtmlFramework>['parameters'] & typeof parameters;
};
