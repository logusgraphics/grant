import { GraphQLResolveInfo } from 'graphql';
import { Context } from '@/graphql/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** Input type for adding a group-permission relationship. */
export type AddGroupPermissionInput = {
  /** ID of the group. */
  groupId: Scalars['ID']['input'];
  /** ID of the permission. */
  permissionId: Scalars['ID']['input'];
};

/** Input type for adding a role-group relationship. */
export type AddRoleGroupInput = {
  /** ID of the group. */
  groupId: Scalars['ID']['input'];
  /** ID of the role. */
  roleId: Scalars['ID']['input'];
};

/** Input type for adding a user-role relationship. */
export type AddUserRoleInput = {
  /** ID of the role. */
  roleId: Scalars['ID']['input'];
  /** ID of the user. */
  userId: Scalars['ID']['input'];
};

/** Base interface for entities with audit fields. */
export type Auditable = {
  /** Timestamp when the entity was created. */
  createdAt: Scalars['String']['output'];
  /** Unique identifier for the entity. */
  id: Scalars['ID']['output'];
  /** Timestamp when the entity was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Base interface for entities that can be created and updated. */
export type Creatable = {
  /** Timestamp when the entity was created. */
  createdAt: Scalars['String']['output'];
  /** Timestamp when the entity was last updated. */
  updatedAt: Scalars['String']['output'];
};

export type CreateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreatePermissionInput = {
  action: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  name: Scalars['String']['input'];
};

/** Input type for creating a new user. */
export type CreateUserInput = {
  /** Email address of the user. */
  email: Scalars['String']['input'];
  /** Full name of the user. */
  name: Scalars['String']['input'];
};

/** Represents a group in the system. */
export type Group = Auditable & {
  __typename?: 'Group';
  /** Timestamp when the group was created. */
  createdAt: Scalars['String']['output'];
  /** Description of the group. */
  description?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for the group. */
  id: Scalars['ID']['output'];
  /** Name of the group. */
  name: Scalars['String']['output'];
  /** List of permissions associated with this group. */
  permissions: Array<Permission>;
  /** Timestamp when the group was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Represents a paginated list of groups. */
export type GroupPage = {
  __typename?: 'GroupPage';
  /** List of groups for the current page. */
  groups: Array<Group>;
  /** Whether there are more groups available on the next page. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Total number of groups across all pages. */
  totalCount: Scalars['Int']['output'];
};

/** Represents a group-permission relationship in the system. */
export type GroupPermission = Auditable & {
  __typename?: 'GroupPermission';
  /** Timestamp when the group-permission relationship was created. */
  createdAt: Scalars['String']['output'];
  /** The group associated with this relationship. */
  group?: Maybe<Group>;
  /** ID of the group. */
  groupId: Scalars['ID']['output'];
  /** Unique identifier for the group-permission relationship. */
  id: Scalars['ID']['output'];
  /** The permission associated with this relationship. */
  permission?: Maybe<Permission>;
  /** ID of the permission. */
  permissionId: Scalars['ID']['output'];
  /** Timestamp when the group-permission relationship was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Input for sorting groups. */
export type GroupSortInput = {
  field: GroupSortableField;
  order: GroupSortOrder;
};

/** Sort order for groups. */
export enum GroupSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Fields by which groups can be sorted. */
export enum GroupSortableField {
  Name = 'name'
}

/** Input type for user authentication. */
export type LoginInput = {
  /** Email address of the user. */
  email: Scalars['String']['input'];
  /** Password of the user. */
  password: Scalars['String']['input'];
};

/** Response type for successful authentication. */
export type LoginResponse = {
  __typename?: 'LoginResponse';
  /** JWT token for authenticated requests. */
  token: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Adds a group-permission relationship. */
  addGroupPermission: GroupPermission;
  /** Adds a role-group relationship. */
  addRoleGroup: RoleGroup;
  /** Adds a user-role relationship. */
  addUserRole: UserRole;
  /** Creates a new group. */
  createGroup: Group;
  /** Creates a new permission. */
  createPermission: Permission;
  /** Creates a new role. */
  createRole: Role;
  /** Creates a new user. */
  createUser: User;
  /** Deletes a group by ID. */
  deleteGroup: Scalars['Boolean']['output'];
  /** Deletes a permission by ID. */
  deletePermission: Scalars['Boolean']['output'];
  /** Deletes a role by ID. */
  deleteRole: Scalars['Boolean']['output'];
  /** Deletes a user. */
  deleteUser: User;
  /** Authenticates a user and returns a JWT token. */
  login: LoginResponse;
  /** Removes a group-permission relationship. */
  removeGroupPermission: Scalars['Boolean']['output'];
  /** Removes a role-group relationship. */
  removeRoleGroup: RoleGroup;
  /** Removes a user-role relationship. */
  removeUserRole: UserRole;
  /** Updates an existing group. */
  updateGroup: Group;
  /** Updates an existing permission. */
  updatePermission: Permission;
  /** Updates an existing role. */
  updateRole: Role;
  /** Updates an existing user. */
  updateUser: User;
};


export type MutationAddGroupPermissionArgs = {
  input: AddGroupPermissionInput;
};


export type MutationAddRoleGroupArgs = {
  input: AddRoleGroupInput;
};


export type MutationAddUserRoleArgs = {
  input: AddUserRoleInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationCreatePermissionArgs = {
  input: CreatePermissionInput;
};


export type MutationCreateRoleArgs = {
  input: CreateRoleInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePermissionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRemoveGroupPermissionArgs = {
  input: RemoveGroupPermissionInput;
};


export type MutationRemoveRoleGroupArgs = {
  input: RemoveRoleGroupInput;
};


export type MutationRemoveUserRoleArgs = {
  input: RemoveUserRoleInput;
};


export type MutationUpdateGroupArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGroupInput;
};


export type MutationUpdatePermissionArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePermissionInput;
};


export type MutationUpdateRoleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRoleInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

/** Represents a permission in the system. */
export type Permission = Auditable & {
  __typename?: 'Permission';
  /** Action associated with the permission. */
  action: Scalars['String']['output'];
  /** Timestamp when the permission was created. */
  createdAt: Scalars['String']['output'];
  /** Description of the permission. */
  description?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for the permission. */
  id: Scalars['ID']['output'];
  /** Name of the permission. */
  name: Scalars['String']['output'];
  /** Timestamp when the permission was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Represents a paginated list of permissions. */
export type PermissionPage = {
  __typename?: 'PermissionPage';
  /** Whether there are more permissions available on the next page. */
  hasNextPage: Scalars['Boolean']['output'];
  /** List of permissions for the current page. */
  permissions: Array<Permission>;
  /** Total number of permissions across all pages. */
  totalCount: Scalars['Int']['output'];
};

/** Input for sorting permissions. */
export type PermissionSortInput = {
  field: PermissionSortableField;
  order: PermissionSortOrder;
};

/** Sort order for permissions. */
export enum PermissionSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Fields by which permissions can be sorted. */
export enum PermissionSortableField {
  Action = 'action',
  Name = 'name'
}

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Retrieves group-permission relationships. */
  groupPermissions: Array<GroupPermission>;
  /** Retrieves a paginated list of groups. */
  groups: GroupPage;
  /** Retrieves a paginated list of permissions. */
  permissions: PermissionPage;
  /** Retrieves role-group relationships for a specific role. */
  roleGroups: Array<RoleGroup>;
  /** Retrieves a paginated list of roles. */
  roles: RolePage;
  /** Retrieves user-role relationships for a specific user. */
  userRoles: Array<UserRole>;
  /** Retrieves a paginated list of users. */
  users: UserPage;
};


export type QueryGroupPermissionsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupsArgs = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<GroupSortInput>;
};


export type QueryPermissionsArgs = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<PermissionSortInput>;
};


export type QueryRoleGroupsArgs = {
  roleId: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<RoleSortInput>;
};


export type QueryUserRolesArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<UserSortInput>;
};

/** Input type for removing a group-permission relationship. */
export type RemoveGroupPermissionInput = {
  /** ID of the group. */
  groupId: Scalars['ID']['input'];
  /** ID of the permission. */
  permissionId: Scalars['ID']['input'];
};

/** Input type for removing a role-group relationship. */
export type RemoveRoleGroupInput = {
  /** ID of the group. */
  groupId: Scalars['ID']['input'];
  /** ID of the role. */
  roleId: Scalars['ID']['input'];
};

/** Input type for removing a user-role relationship. */
export type RemoveUserRoleInput = {
  /** ID of the role. */
  roleId: Scalars['ID']['input'];
  /** ID of the user. */
  userId: Scalars['ID']['input'];
};

/** Represents a role in the system. */
export type Role = Auditable & {
  __typename?: 'Role';
  /** Timestamp when the role was created. */
  createdAt: Scalars['String']['output'];
  /** Description of the role. */
  description?: Maybe<Scalars['String']['output']>;
  /** List of groups associated with this role. */
  groups: Array<Group>;
  /** Unique identifier for the role. */
  id: Scalars['ID']['output'];
  /** Name of the role. */
  name: Scalars['String']['output'];
  /** Timestamp when the role was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Represents a role-group relationship in the system. */
export type RoleGroup = Auditable & {
  __typename?: 'RoleGroup';
  /** Timestamp when the role-group relationship was created. */
  createdAt: Scalars['String']['output'];
  /** The group associated with this relationship. */
  group?: Maybe<Group>;
  /** ID of the group. */
  groupId: Scalars['ID']['output'];
  /** Unique identifier for the role-group relationship. */
  id: Scalars['ID']['output'];
  /** The role associated with this relationship. */
  role?: Maybe<Role>;
  /** ID of the role. */
  roleId: Scalars['ID']['output'];
  /** Timestamp when the role-group relationship was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Represents a paginated list of roles. */
export type RolePage = {
  __typename?: 'RolePage';
  /** Whether there are more roles available on the next page. */
  hasNextPage: Scalars['Boolean']['output'];
  /** List of roles for the current page. */
  roles: Array<Role>;
  /** Total number of roles across all pages. */
  totalCount: Scalars['Int']['output'];
};

/** Input for sorting roles. */
export type RoleSortInput = {
  field: RoleSortableField;
  order: RoleSortOrder;
};

/** Sort order for roles. */
export enum RoleSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Fields by which roles can be sorted. */
export enum RoleSortableField {
  Name = 'name'
}

export type UpdateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePermissionInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Input type for updating an existing user. */
export type UpdateUserInput = {
  /** Email address of the user. */
  email: Scalars['String']['input'];
  /** Full name of the user. */
  name: Scalars['String']['input'];
};

/** Represents a user in the system. */
export type User = Auditable & {
  __typename?: 'User';
  /** Timestamp when the user was created. */
  createdAt: Scalars['String']['output'];
  /** Email address of the user. */
  email: Scalars['String']['output'];
  /** Unique identifier for the user. */
  id: Scalars['ID']['output'];
  /** Full name of the user. */
  name: Scalars['String']['output'];
  /** List of roles assigned to the user. */
  roles: Array<Role>;
  /** Timestamp when the user was last updated. */
  updatedAt: Scalars['String']['output'];
};

/** Represents a paginated list of users. */
export type UserPage = {
  __typename?: 'UserPage';
  /** Whether there are more users available on the next page. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Total number of users across all pages. */
  totalCount: Scalars['Int']['output'];
  /** List of users for the current page. */
  users: Array<User>;
};

/** Represents a user-role relationship in the system. */
export type UserRole = Auditable & {
  __typename?: 'UserRole';
  /** Timestamp when the user-role relationship was created. */
  createdAt: Scalars['String']['output'];
  /** Unique identifier for the user-role relationship. */
  id: Scalars['ID']['output'];
  /** The role associated with this relationship. */
  role: Role;
  /** ID of the role. */
  roleId: Scalars['ID']['output'];
  /** Timestamp when the user-role relationship was last updated. */
  updatedAt: Scalars['String']['output'];
  /** The user associated with this relationship. */
  user: User;
  /** ID of the user. */
  userId: Scalars['ID']['output'];
};

/** Input for sorting users. */
export type UserSortInput = {
  field: UserSortableField;
  order: UserSortOrder;
};

/** Sort order for users. */
export enum UserSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Fields by which users can be sorted. */
export enum UserSortableField {
  Email = 'email',
  Name = 'name'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Auditable: ( Group ) | ( GroupPermission ) | ( Permission ) | ( Role ) | ( RoleGroup ) | ( User ) | ( UserRole );
  Creatable: never;
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AddGroupPermissionInput: AddGroupPermissionInput;
  AddRoleGroupInput: AddRoleGroupInput;
  AddUserRoleInput: AddUserRoleInput;
  Auditable: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Auditable']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Creatable: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Creatable']>;
  CreateGroupInput: CreateGroupInput;
  CreatePermissionInput: CreatePermissionInput;
  CreateRoleInput: CreateRoleInput;
  CreateUserInput: CreateUserInput;
  Group: ResolverTypeWrapper<Group>;
  GroupPage: ResolverTypeWrapper<GroupPage>;
  GroupPermission: ResolverTypeWrapper<GroupPermission>;
  GroupSortInput: GroupSortInput;
  GroupSortOrder: GroupSortOrder;
  GroupSortableField: GroupSortableField;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LoginInput: LoginInput;
  LoginResponse: ResolverTypeWrapper<LoginResponse>;
  Mutation: ResolverTypeWrapper<{}>;
  Permission: ResolverTypeWrapper<Permission>;
  PermissionPage: ResolverTypeWrapper<PermissionPage>;
  PermissionSortInput: PermissionSortInput;
  PermissionSortOrder: PermissionSortOrder;
  PermissionSortableField: PermissionSortableField;
  Query: ResolverTypeWrapper<{}>;
  RemoveGroupPermissionInput: RemoveGroupPermissionInput;
  RemoveRoleGroupInput: RemoveRoleGroupInput;
  RemoveUserRoleInput: RemoveUserRoleInput;
  Role: ResolverTypeWrapper<Role>;
  RoleGroup: ResolverTypeWrapper<RoleGroup>;
  RolePage: ResolverTypeWrapper<RolePage>;
  RoleSortInput: RoleSortInput;
  RoleSortOrder: RoleSortOrder;
  RoleSortableField: RoleSortableField;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateGroupInput: UpdateGroupInput;
  UpdatePermissionInput: UpdatePermissionInput;
  UpdateRoleInput: UpdateRoleInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User>;
  UserPage: ResolverTypeWrapper<UserPage>;
  UserRole: ResolverTypeWrapper<UserRole>;
  UserSortInput: UserSortInput;
  UserSortOrder: UserSortOrder;
  UserSortableField: UserSortableField;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddGroupPermissionInput: AddGroupPermissionInput;
  AddRoleGroupInput: AddRoleGroupInput;
  AddUserRoleInput: AddUserRoleInput;
  Auditable: ResolversInterfaceTypes<ResolversParentTypes>['Auditable'];
  Boolean: Scalars['Boolean']['output'];
  Creatable: ResolversInterfaceTypes<ResolversParentTypes>['Creatable'];
  CreateGroupInput: CreateGroupInput;
  CreatePermissionInput: CreatePermissionInput;
  CreateRoleInput: CreateRoleInput;
  CreateUserInput: CreateUserInput;
  Group: Group;
  GroupPage: GroupPage;
  GroupPermission: GroupPermission;
  GroupSortInput: GroupSortInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LoginInput: LoginInput;
  LoginResponse: LoginResponse;
  Mutation: {};
  Permission: Permission;
  PermissionPage: PermissionPage;
  PermissionSortInput: PermissionSortInput;
  Query: {};
  RemoveGroupPermissionInput: RemoveGroupPermissionInput;
  RemoveRoleGroupInput: RemoveRoleGroupInput;
  RemoveUserRoleInput: RemoveUserRoleInput;
  Role: Role;
  RoleGroup: RoleGroup;
  RolePage: RolePage;
  RoleSortInput: RoleSortInput;
  String: Scalars['String']['output'];
  UpdateGroupInput: UpdateGroupInput;
  UpdatePermissionInput: UpdatePermissionInput;
  UpdateRoleInput: UpdateRoleInput;
  UpdateUserInput: UpdateUserInput;
  User: User;
  UserPage: UserPage;
  UserRole: UserRole;
  UserSortInput: UserSortInput;
}>;

export type AuditableResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Auditable'] = ResolversParentTypes['Auditable']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Group' | 'GroupPermission' | 'Permission' | 'Role' | 'RoleGroup' | 'User' | 'UserRole', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type CreatableResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Creatable'] = ResolversParentTypes['Creatable']> = ResolversObject<{
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type GroupResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Group'] = ResolversParentTypes['Group']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GroupPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GroupPage'] = ResolversParentTypes['GroupPage']> = ResolversObject<{
  groups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GroupPermissionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GroupPermission'] = ResolversParentTypes['GroupPermission']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType>;
  groupId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  permission?: Resolver<Maybe<ResolversTypes['Permission']>, ParentType, ContextType>;
  permissionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addGroupPermission?: Resolver<ResolversTypes['GroupPermission'], ParentType, ContextType, RequireFields<MutationAddGroupPermissionArgs, 'input'>>;
  addRoleGroup?: Resolver<ResolversTypes['RoleGroup'], ParentType, ContextType, RequireFields<MutationAddRoleGroupArgs, 'input'>>;
  addUserRole?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType, RequireFields<MutationAddUserRoleArgs, 'input'>>;
  createGroup?: Resolver<ResolversTypes['Group'], ParentType, ContextType, RequireFields<MutationCreateGroupArgs, 'input'>>;
  createPermission?: Resolver<ResolversTypes['Permission'], ParentType, ContextType, RequireFields<MutationCreatePermissionArgs, 'input'>>;
  createRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationCreateRoleArgs, 'input'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  deleteGroup?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGroupArgs, 'id'>>;
  deletePermission?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePermissionArgs, 'id'>>;
  deleteRole?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteRoleArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  login?: Resolver<ResolversTypes['LoginResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  removeGroupPermission?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRemoveGroupPermissionArgs, 'input'>>;
  removeRoleGroup?: Resolver<ResolversTypes['RoleGroup'], ParentType, ContextType, RequireFields<MutationRemoveRoleGroupArgs, 'input'>>;
  removeUserRole?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType, RequireFields<MutationRemoveUserRoleArgs, 'input'>>;
  updateGroup?: Resolver<ResolversTypes['Group'], ParentType, ContextType, RequireFields<MutationUpdateGroupArgs, 'id' | 'input'>>;
  updatePermission?: Resolver<ResolversTypes['Permission'], ParentType, ContextType, RequireFields<MutationUpdatePermissionArgs, 'id' | 'input'>>;
  updateRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUpdateRoleArgs, 'id' | 'input'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'id' | 'input'>>;
}>;

export type PermissionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Permission'] = ResolversParentTypes['Permission']> = ResolversObject<{
  action?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PermissionPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PermissionPage'] = ResolversParentTypes['PermissionPage']> = ResolversObject<{
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groupPermissions?: Resolver<Array<ResolversTypes['GroupPermission']>, ParentType, ContextType, RequireFields<QueryGroupPermissionsArgs, 'groupId'>>;
  groups?: Resolver<ResolversTypes['GroupPage'], ParentType, ContextType, Partial<QueryGroupsArgs>>;
  permissions?: Resolver<ResolversTypes['PermissionPage'], ParentType, ContextType, Partial<QueryPermissionsArgs>>;
  roleGroups?: Resolver<Array<ResolversTypes['RoleGroup']>, ParentType, ContextType, RequireFields<QueryRoleGroupsArgs, 'roleId'>>;
  roles?: Resolver<ResolversTypes['RolePage'], ParentType, ContextType, Partial<QueryRolesArgs>>;
  userRoles?: Resolver<Array<ResolversTypes['UserRole']>, ParentType, ContextType, RequireFields<QueryUserRolesArgs, 'userId'>>;
  users?: Resolver<ResolversTypes['UserPage'], ParentType, ContextType, Partial<QueryUsersArgs>>;
}>;

export type RoleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RoleGroupResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RoleGroup'] = ResolversParentTypes['RoleGroup']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType>;
  groupId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RolePageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RolePage'] = ResolversParentTypes['RolePage']> = ResolversObject<{
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserPage'] = ResolversParentTypes['UserPage']> = ResolversObject<{
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserRoleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserRole'] = ResolversParentTypes['UserRole']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Auditable?: AuditableResolvers<ContextType>;
  Creatable?: CreatableResolvers<ContextType>;
  Group?: GroupResolvers<ContextType>;
  GroupPage?: GroupPageResolvers<ContextType>;
  GroupPermission?: GroupPermissionResolvers<ContextType>;
  LoginResponse?: LoginResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Permission?: PermissionResolvers<ContextType>;
  PermissionPage?: PermissionPageResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RoleGroup?: RoleGroupResolvers<ContextType>;
  RolePage?: RolePageResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserPage?: UserPageResolvers<ContextType>;
  UserRole?: UserRoleResolvers<ContextType>;
}>;

