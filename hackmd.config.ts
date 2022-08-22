import config from './lib/config'
import dotenv from 'dotenv'

dotenv.config()

export default config({
  accessToken: process.env.HACKMD_ACCESS_TOKEN,
  workspaceTeamPath: process.env.HACKMD_WORKSPACE_TEAM_PATH
})