import HackMDAPI from '@hackmd/api'

export type ThemeDevWorkspaceConfig = {
  accessToken: string,
  workspaceTeamPath: string
}

export default function (config: ThemeDevWorkspaceConfig) {
  if (!config.accessToken) {
    throw new Error('Missing accessToken in config')
  }

  if (!config.workspaceTeamPath) {
    throw new Error('Missing workspaceTeamPath in config')
  }

  const api = new HackMDAPI(config.accessToken)

  return {
    api,
    workspaceTeamPath: config.workspaceTeamPath
  }
}