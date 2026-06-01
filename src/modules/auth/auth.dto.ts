export interface UserDTO {
  id: string
  fullName: string
  email: string
}

export interface AuthResponseDTO {
  user: UserDTO
  accessToken: string
}

export interface MeResponseDTO {
  user: UserDTO
}
