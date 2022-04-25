// third-party imports
import { Type } from '@sinclair/typebox'

// local imports


export const CreateUserModel = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    posts: Type.Array(CreatePostModel)
})
