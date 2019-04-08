import * as I from 'immutable'
import * as ChatTypes from './types/chat2'
import * as Types from './types/teams'
import * as RPCTypes from './types/rpc-types'
import * as RPCTypesVal from './types/rpc-gen'
import * as RPCChatTypes from './types/rpc-chat-types'
import * as RPCChatTypesVal from './types/rpc-chat-gen'
import {invert} from 'lodash-es'
import {getPathProps} from '../route-tree'
import {teamsTab} from './tabs'
import {memoize} from '../util/memoize'

import {Service} from './types/search'
import {_RetentionPolicy, RetentionPolicy} from './types/retention-policy'
import {TypedState} from './reducer'

export const teamRoleTypes = ['reader', 'writer', 'admin', 'owner']

export const rpcMemberStatusToStatus = invert(RPCTypes.teamsTeamMemberStatus)

// Waiting keys
// Add granularity as necessary
export const teamsLoadedWaitingKey = 'teams:loaded'
export const teamsAccessRequestWaitingKey = 'teams:accessRequests'
export const teamWaitingKey = (teamname: Types.Teamname) => `team:${teamname}`
export const teamGetWaitingKey = (teamname: Types.Teamname) => `teamGet:${teamname}`
export const teamTarsWaitingKey = (teamname: Types.Teamname) => `teamTars:${teamname}`
export const teamCreationWaitingKey = 'teamCreate'

export const addUserToTeamsWaitingKey = (username: string) => `addUserToTeams:${username}`
export const addPeopleToTeamWaitingKey = (teamname: Types.Teamname) => `teamAddPeople:${teamname}`
export const addToTeamByEmailWaitingKey = (teamname: Types.Teamname) => `teamAddByEmail:${teamname}`
export const getChannelsWaitingKey = (teamname: Types.Teamname) => `getChannels:${teamname}`
export const createChannelWaitingKey = (teamname: Types.Teamname) => `createChannel:${teamname}`
export const settingsWaitingKey = (teamname: Types.Teamname) => `teamSettings:${teamname}`
export const retentionWaitingKey = (teamname: Types.Teamname) => `teamRetention:${teamname}`
export const addMemberWaitingKey = (teamname: Types.Teamname, username: string) =>
  `teamAdd:${teamname};${username}`
// also for pending invites, hence id rather than username
export const removeMemberWaitingKey = (teamname: Types.Teamname, id: string) => `teamRemove:${teamname};${id}`
export const addToTeamSearchKey = 'addToTeamSearch'
export const teamProfileAddListWaitingKey = 'teamProfileAddList'
export const leaveTeamWaitingKey = (teamname: Types.Teamname) => `teamLeave:${teamname}`

export const makeChannelInfo: I.Record.Factory<Types._ChannelInfo> = I.Record({
  channelname: '',
  description: '',
  participants: I.Set(),
})

export const makeMemberInfo: I.Record.Factory<Types._MemberInfo> = I.Record({
  fullName: '',
  status: 'active',
  type: 'reader',
  username: '',
} as Types._MemberInfo)

export const makeInviteInfo: I.Record.Factory<Types._InviteInfo> = I.Record({
  email: '',
  id: '',
  name: '',
  role: 'writer',
  username: '',
} as Types._InviteInfo)

export const makeRequestInfo: I.Record.Factory<Types._RequestInfo> = I.Record({
  username: '',
})

export const makeEmailInviteError: I.Record.Factory<Types._EmailInviteError> = I.Record({
  malformed: I.Set(),
  message: '',
})

export const teamRoleByEnum = ((m: {[K in Types.MaybeTeamRoleType]: RPCTypes.TeamRole}) => {
  const mInv: {[K in RPCTypes.TeamRole]: Types.MaybeTeamRoleType} = {} as any
  for (const roleStr in m) {
    // roleStr is typed as string; see
    // https://github.com/facebook/flow/issues/1736 .
    // $ForceType
    const role: Types.TeamRoleType = roleStr as Types.TeamRoleType
    const e = m[role]
    mInv[e] = role
  }
  return mInv
  // @ts-ignore
})(RPCTypesVal.teamsTeamRole)

export const typeToLabel: Types.TypeMap = {
  admin: 'Admin',
  owner: 'Owner',
  reader: 'Reader',
  writer: 'Writer',
}

export const makeTeamSettings: I.Record.Factory<Types._TeamSettings> = I.Record({
  joinAs: RPCTypes.teamsTeamRole.reader,
  open: false,
} as Types._TeamSettings)

export const makeRetentionPolicy: I.Record.Factory<_RetentionPolicy> = I.Record({
  seconds: 0,
  title: '',
  type: 'retain',
} as _RetentionPolicy)

export const makeState: I.Record.Factory<Types._State> = I.Record({
  addUserToTeamsResults: '',
  addUserToTeamsState: 'notStarted',
  channelCreationError: '',
  emailInviteError: makeEmailInviteError(),
  newTeamRequests: I.List(),
  newTeams: I.Set(),
  sawChatBanner: false,
  sawSubteamsBanner: false,
  teamAccessRequestsPending: I.Set(),
  teamCreationError: '',
  teamInviteError: '',
  teamJoinError: '',
  teamJoinSuccess: false,
  teamJoinSuccessTeamName: '',
  teamNameToAllowPromote: I.Map(),
  teamNameToCanPerform: I.Map(),
  teamNameToChannelInfos: I.Map(),
  teamNameToID: I.Map(),
  teamNameToInvites: I.Map(),
  teamNameToIsOpen: I.Map(),
  teamNameToIsShowcasing: I.Map(),
  teamNameToLoadingInvites: I.Map(),
  teamNameToMemberUsernames: I.Map(),
  teamNameToMembers: I.Map(),
  teamNameToPublicitySettings: I.Map(),
  teamNameToRequests: I.Map(),
  teamNameToResetUsers: I.Map(),
  teamNameToRetentionPolicy: I.Map(),
  teamNameToRole: I.Map(),
  teamNameToSettings: I.Map(),
  teamNameToSubteams: I.Map(),
  teamProfileAddList: I.List(),
  teammembercounts: I.Map(),
  teamnames: I.Set(),
  teamsWithChosenChannels: I.Set(),
} as Types._State)

export const initialCanUserPerform: RPCTypes.TeamOperation = {
  changeOpenTeam: false,
  changeTarsDisabled: false,
  chat: false,
  createChannel: false,
  deleteChannel: false,
  deleteChatHistory: false,
  deleteOtherMessages: false,
  editChannelDescription: false,
  joinTeam: false,
  leaveTeam: false,
  listFirst: false,
  manageMembers: false,
  manageSubteams: false,
  renameChannel: false,
  setMemberShowcase: false,
  setMinWriterRole: false,
  setPublicityAny: false,
  setRetentionPolicy: false,
  setTeamShowcase: false,
}

const dayInS = 3600 * 24
const policyInherit = makeRetentionPolicy({title: '', type: 'inherit'})
const policyRetain = makeRetentionPolicy({title: 'Never auto-delete', type: 'retain'})
const policyThirtySeconds = makeRetentionPolicy({seconds: 30, title: '30 seconds', type: 'explode'})
const policyFiveMinutes = makeRetentionPolicy({seconds: 5 * 60, title: '5 minutes', type: 'explode'})
const policyOneHour = makeRetentionPolicy({seconds: 3600, title: '60 minutes', type: 'explode'})
const policySixHours = makeRetentionPolicy({seconds: 3600 * 6, title: '6 hours', type: 'explode'})
const policyOneDay = makeRetentionPolicy({seconds: dayInS, title: '24 hours', type: 'explode'})
const policyThreeDays = makeRetentionPolicy({seconds: 3 * dayInS, title: '3 days', type: 'explode'})
const policySevenDays = makeRetentionPolicy({seconds: 7 * dayInS, title: '7 days', type: 'explode'})
const policyMonth = makeRetentionPolicy({seconds: 30 * dayInS, title: '30 days', type: 'expire'})
const policyThreeMonths = makeRetentionPolicy({seconds: 90 * dayInS, title: '90 days', type: 'expire'})
const policySixMonths = makeRetentionPolicy({seconds: 180 * dayInS, title: '180 days', type: 'expire'})
const policyYear = makeRetentionPolicy({seconds: 365 * dayInS, title: '365 days', type: 'expire'})
const baseRetentionPolicies = [
  policyRetain,
  policyYear,
  policySixMonths,
  policyThreeMonths,
  policyMonth,
  policySevenDays,
  policyThreeDays,
  policyOneDay,
  policySixHours,
  policyOneHour,
  policyFiveMinutes,
  policyThirtySeconds,
]
const retentionPolicies = {
  policyFiveMinutes,
  policyInherit,
  policyMonth,
  policyOneDay,
  policyOneHour,
  policyRetain,
  policySevenDays,
  policySixHours,
  policySixMonths,
  policyThirtySeconds,
  policyThreeDays,
  policyThreeMonths,
  policyYear,
}

const userIsActiveInTeamHelper = (
  state: TypedState,
  _username: string | null,
  _service: Service | null,
  _teamname: string | null
): boolean => {
  const username = _username || ''
  const service = _service || ''
  const teamname = _teamname || ''
  if (service !== 'Keybase') {
    return false
  }

  const members = state.teams.teamNameToMembers.get(teamname)
  if (!members) {
    return false
  }

  const member = members.get(username)
  if (!member) {
    return false
  }

  return member.status === 'active'
}

const getEmailInviteError = (state: TypedState) => state.teams.emailInviteError

const isTeamWithChosenChannels = (state: TypedState, teamname: string): boolean =>
  state.teams.teamsWithChosenChannels.has(teamname)

const getTeamChannelInfos = (
  state: TypedState,
  teamname: Types.Teamname
): I.Map<ChatTypes.ConversationIDKey, Types.ChannelInfo> => {
  // @ts-ignore
  return state.teams.getIn(['teamNameToChannelInfos', teamname], I.Map())
}

const getChannelInfoFromConvID = (
  state: TypedState,
  teamname: Types.Teamname,
  conversationIDKey: ChatTypes.ConversationIDKey
): Types.ChannelInfo | null => getTeamChannelInfos(state, teamname).get(conversationIDKey)

const getRole = (state: TypedState, teamname: Types.Teamname): Types.MaybeTeamRoleType =>
  // @ts-ignore
  state.teams.getIn(['teamNameToRole', teamname], 'none' as Types.MaybeTeamRoleType)

const getCanPerform = (state: TypedState, teamname: Types.Teamname): RPCTypes.TeamOperation =>
  // @ts-ignore
  state.teams.getIn(['teamNameToCanPerform', teamname], initialCanUserPerform)

const hasCanPerform = (state: TypedState, teamname: Types.Teamname): boolean =>
  state.teams.hasIn(['teamNameToCanPerform', teamname])

const hasChannelInfos = (state: TypedState, teamname: Types.Teamname): boolean =>
  state.teams.hasIn(['teamNameToChannelInfos', teamname])

const getTeamMemberCount = (state: TypedState, teamname: Types.Teamname): number =>
  // @ts-ignore
  state.teams.getIn(['teammembercounts', teamname], 0)

const isLastOwner = (state: TypedState, teamname: Types.Teamname): boolean =>
  isOwner(getRole(state, teamname)) && !isMultiOwnerTeam(state, teamname)

const isMultiOwnerTeam = (state: TypedState, teamname: Types.Teamname): boolean => {
  let countOfOwners = 0
  const allTeamMembers = state.teams.teamNameToMembers.get(teamname, I.Map())
  const moreThanOneOwner = allTeamMembers.some(tm => {
    if (isOwner((tm as I.RecordOf<Types._MemberInfo>).type)) {
      countOfOwners++
    }
    return countOfOwners > 1
  })
  return moreThanOneOwner
}

const getTeamID = (state: TypedState, teamname: Types.Teamname): string =>
  // @ts-ignore
  state.teams.getIn(['teamNameToID', teamname], '')

const getTeamNameFromID = (state: TypedState, teamID: string): Types.Teamname | null =>
  state.teams.teamNameToID.findKey(value => value === teamID)

const getTeamRetentionPolicy = (state: TypedState, teamname: Types.Teamname): RetentionPolicy | null =>
  // @ts-ignore
  state.teams.getIn(['teamNameToRetentionPolicy', teamname], null)

const getSelectedTeamNames = (state: TypedState): Types.Teamname[] => {
  const pathProps = getPathProps(state.routeTree.routeState, [teamsTab])
  return pathProps.reduce((res, val) => {
    const teamname = val.props.get('teamname')
    if (val.node === 'team' && teamname) {
      return res.concat(teamname)
    }
    return res
  }, [])
}

/**
 *  Gets the number of channels you're subscribed to on a team
 */
const getNumberOfSubscribedChannels = (state: TypedState, teamname: Types.Teamname): number =>
  state.chat2.metaMap.count(c => c.teamname === teamname)

/**
 * Gets whether the team is big or small for teams you are a member of
 */
const getTeamType = (state: TypedState, teamname: Types.Teamname): 'big' | 'small' | null => {
  const mm = state.chat2.metaMap
  const conv = mm.find(c => c.teamname === teamname)
  if (conv) {
    if (conv.teamType === 'big' || conv.teamType === 'small') {
      return conv.teamType
    }
  }
  return null
}

/**
 * Returns true if the team is big and you're a member
 */
const isBigTeam = (state: TypedState, teamname: Types.Teamname): boolean =>
  getTeamType(state, teamname) === 'big'

const getTeamMembers = (state: TypedState, teamname: Types.Teamname): I.Map<string, Types.MemberInfo> =>
  // @ts-ignore
  state.teams.getIn(['teamNameToMembers', teamname], I.Map())

const getTeamPublicitySettings = (state: TypedState, teamname: Types.Teamname): Types._PublicitySettings =>
  // @ts-ignore
  state.teams.getIn(['teamNameToPublicitySettings', teamname], {
    anyMemberShowcase: false,
    description: '',
    ignoreAccessRequests: false,
    member: false,
    team: false,
  })

const getTeamInvites = (state: TypedState, teamname: Types.Teamname): I.Set<Types.InviteInfo> =>
  // @ts-ignore
  state.teams.getIn(['teamNameToInvites', teamname], I.Set())

// Note that for isInTeam and isInSomeTeam, we don't use 'teamnames',
// since that may contain subteams you're not a member of.

const isInTeam = (state: TypedState, teamname: Types.Teamname): boolean => getRole(state, teamname) !== 'none'

const isInSomeTeam = (state: TypedState): boolean =>
  !!state.teams.teamNameToRole.find(role => role !== 'none')

const isAccessRequestPending = (state: TypedState, teamname: Types.Teamname): boolean =>
  state.teams.hasIn(['teamNameAccessRequestsPending', teamname])

const getTeamSubteams = (state: TypedState, teamname: Types.Teamname): I.Set<Types.Teamname> =>
  // @ts-ignore
  state.teams.getIn(['teamNameToSubteams', teamname], I.Set())

const getTeamSettings = (state: TypedState, teamname: Types.Teamname): Types.TeamSettings =>
  // @ts-ignore
  state.teams.getIn(['teamNameToSettings', teamname], makeTeamSettings())

const getTeamResetUsers = (state: TypedState, teamname: Types.Teamname): I.Set<Types.ResetUser> =>
  // @ts-ignore
  state.teams.getIn(['teamNameToResetUsers', teamname], I.Set())

const getTeamLoadingInvites = (state: TypedState, teamname: Types.Teamname): I.Map<string, boolean> =>
  // @ts-ignore
  state.teams.getIn(['teamNameToLoadingInvites', teamname], I.Map())

const getTeamRequests = (state: TypedState, teamname: Types.Teamname): I.Set<Types.RequestInfo> =>
  // @ts-ignore
  state.teams.getIn(['teamNameToRequests', teamname], I.Set())

// Sorts teamnames canonically.
function sortTeamnames(a: string, b: string) {
  const aName = a.toUpperCase()
  const bName = b.toUpperCase()
  if (aName < bName) {
    return -1
  } else if (aName > bName) {
    return 1
  } else {
    return 0
  }
}

const _memoizedSorted = memoize(names => names.toArray().sort(sortTeamnames))
const getSortedTeamnames = (state: TypedState): Types.Teamname[] => _memoizedSorted(state.teams.teamnames)

const isAdmin = (type: Types.MaybeTeamRoleType) => type === 'admin'
const isOwner = (type: Types.MaybeTeamRoleType) => type === 'owner'

// TODO make this check for only valid subteam names
const isSubteam = (maybeTeamname: string) => {
  const subteams = maybeTeamname.split('.')
  if (subteams.length <= 1) {
    return false
  }
  return true
}
const serviceRetentionPolicyToRetentionPolicy = (
  policy: RPCChatTypes.RetentionPolicy | null
): RetentionPolicy => {
  // !policy implies a default policy of retainment
  let retentionPolicy: RetentionPolicy = makeRetentionPolicy({type: 'retain'})
  if (policy) {
    // replace retentionPolicy with whatever is explicitly set
    switch (policy.typ) {
      case RPCChatTypesVal.commonRetentionPolicyType.retain:
        retentionPolicy = makeRetentionPolicy({title: 'Never auto-delete', type: 'retain'})
        break
      case RPCChatTypesVal.commonRetentionPolicyType.expire:
        // @ts-ignore
        if (!policy.expire) {
          throw new Error(`RPC returned retention policy of type 'expire' with no expire data`)
        }
        // @ts-ignore
        const {expire} = policy
        retentionPolicy = makeRetentionPolicy({
          seconds: expire.age,
          // Auto generated from flowToTs. Please clean me!
          title:
            (baseRetentionPolicies.find(p => p.seconds === expire.age) === null ||
            baseRetentionPolicies.find(p => p.seconds === expire.age) === undefined
              ? undefined
              : baseRetentionPolicies.find(p => p.seconds === expire.age).title) || `${expire.age} seconds`,
          type: 'expire',
        })
        break
      case RPCChatTypesVal.commonRetentionPolicyType.ephemeral:
        // @ts-ignore
        if (!policy.ephemeral) {
          throw new Error(`RPC returned retention policy of type 'ephemeral' with no ephemeral data`)
        }
        // @ts-ignore
        const {ephemeral} = policy
        retentionPolicy = makeRetentionPolicy({
          seconds: ephemeral.age,
          title:
            // Auto generated from flowToTs. Please clean me!
            (baseRetentionPolicies.find(p => p.seconds === ephemeral.age) === null ||
            baseRetentionPolicies.find(p => p.seconds === ephemeral.age) === undefined
              ? undefined
              : baseRetentionPolicies.find(p => p.seconds === ephemeral.age).title) ||
            `${ephemeral.age} seconds`,
          type: 'explode',
        })
        break
      case RPCChatTypes.commonRetentionPolicyType.inherit:
        retentionPolicy = makeRetentionPolicy({type: 'inherit'})
    }
  }
  return retentionPolicy
}

const retentionPolicyToServiceRetentionPolicy = (policy: RetentionPolicy): RPCChatTypes.RetentionPolicy => {
  let res: RPCChatTypes.RetentionPolicy | null
  switch (policy.type) {
    case 'retain':
      // @ts-ignore
      res = {retain: {}, typ: RPCChatTypes.commonRetentionPolicyType.retain}
      break
    case 'expire':
      // @ts-ignore
      res = {expire: {age: policy.seconds}, typ: RPCChatTypes.commonRetentionPolicyType.expire}
      break
    case 'explode':
      // @ts-ignore
      res = {ephemeral: {age: policy.seconds}, typ: RPCChatTypes.commonRetentionPolicyType.ephemeral}
      break
    case 'inherit':
      // @ts-ignore
      res = {inherit: {}, typ: RPCChatTypes.commonRetentionPolicyType.inherit}
      break
  }
  if (!res) {
    throw new Error(`Unable to convert retention policy of unknown type: ${policy.type}`)
  }
  return res
}

// How many public admins should we display on a showcased team card at once?
export const publicAdminsLimit = 6

export const resetUserBadgeIDToKey = (id: Types.ResetUserBadgeID): Types.ResetUserBadgeIDKey =>
  id.toString('hex')
export const keyToResetUserBadgeID = (key: Types.ResetUserBadgeIDKey): Types.ResetUserBadgeID =>
  Buffer.from(key, 'hex')

export const makeResetUser: I.Record.Factory<Types._ResetUser> = I.Record({
  badgeIDKey: '',
  username: '',
})

export const chosenChannelsGregorKey = 'chosenChannelsForTeam'

export {
  getNumberOfSubscribedChannels,
  getRole,
  getCanPerform,
  hasCanPerform,
  hasChannelInfos,
  getEmailInviteError,
  getTeamMemberCount,
  isLastOwner,
  userIsActiveInTeamHelper,
  getTeamChannelInfos,
  getChannelInfoFromConvID,
  getTeamID,
  getTeamRetentionPolicy,
  getTeamMembers,
  getTeamNameFromID,
  getTeamPublicitySettings,
  getTeamInvites,
  isInTeam,
  isInSomeTeam,
  isAccessRequestPending,
  getSelectedTeamNames,
  getTeamSubteams,
  getTeamSettings,
  getTeamResetUsers,
  getTeamLoadingInvites,
  getTeamRequests,
  getSortedTeamnames,
  getTeamType,
  isAdmin,
  isBigTeam,
  isOwner,
  isSubteam,
  isTeamWithChosenChannels,
  serviceRetentionPolicyToRetentionPolicy,
  retentionPolicyToServiceRetentionPolicy,
  baseRetentionPolicies,
  retentionPolicies,
}