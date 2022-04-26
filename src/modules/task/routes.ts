//@ts-nocheck

export const tags = [];
export const models = [];

export function router (fastify, opts) {
    
    fastify.get(
        '/task',
        {
            schema: {
                description: '',
                tags: []
            }
        },
        (request, reply) => {
            
        })
        
}