import { projectAppSignUpRoleResolver as signUpRole } from './sign-up-role.resolver';
import { projectAppTagsResolver as tags } from './tags.resolver';

export const projectAppResolver = {
  signUpRole,
  tags,
};
