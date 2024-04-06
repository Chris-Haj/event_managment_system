import React from 'react'

const posts = [
    {id: 1, title: 'Post 1', content: 'Content'},
    {id: 2, title: 'Post 2', content: 'Content'}
];

function ViewEvents() {
    let divPosts = posts.map(post => (
            <div key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
            </div>
        )
    )
    return (
        <div>
            <h2>Posts</h2>
            <div>
                {divPosts}
            </div>
        </div>
    );
}
export default ViewEvents;