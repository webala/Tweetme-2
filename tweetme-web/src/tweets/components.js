import React, {useState, useEffect} from 'react';
import {createTweet, loadTweets} from '../lookup';

export function TweetsComponent(props) {
    const textAreaRef = React.createRef()
    const [newTweets, setNewTweets] = useState([])

    const handleBackendUpdate = (response, status) => {
      //backend api response handler
      const tempTweets = [...newTweets]
      if (status === 201){
        tempTweets.unshift(response)
        setNewTweets(tempTweets)
      }else {
        console.log(response)
        alert('An error occured. Please try again')
      }
    }

    const handleSubmit = event => {
      //backend api request
        event.preventDefault()
        //console.log(event)
       // console.log(textAreaRef.current.value) 
        const newTweet = textAreaRef.current.value
        
        console.log('new Tweet', newTweet)
        createTweet(newTweet, handleBackendUpdate)
        
        textAreaRef.current.value = ''

    }
    return (
  <div className={props.className}>

      <div className='col-12 mb-3'>   
        <form onSubmit={handleSubmit}>
            <textarea ref={textAreaRef} required={true} className='form form-control' name='tweet'>

            </textarea>
            <button type='submit' className='btn btn-primary my-3'>Tweet</button>
        </form>
      </div> 
      <TweetsList newTweets={newTweets}/>
    </div>
    )
}

export function TweetsList(props) {
        const [tweetsInit, setTweetsInit] = useState(props.newTweets ? props.newTweets : [])
        const [tweets, setTweets] = useState([])
        const [tweetsDidSet, setTweetsDidSet] = useState(false)
        useEffect(() => { 
          const final = [...props.newTweets].concat(tweetsInit)
          if (final.length !== tweets.length) {
            setTweets(final)
          }
          

        },[props.newTweets, tweetsInit, tweets])
        useEffect(() => {
          if (tweetsDidSet === false){
          const myCallBack = (response, status) => {
            if (status === 200) {
              const final = [...response].concat(tweetsInit)
              setTweetsInit(final)
              setTweetsDidSet(true)
            } else {
              alert("There was an error")
            }
          }
          loadTweets(myCallBack)
        }
        }, [tweetsInit,tweetsDidSet, setTweetsDidSet])
      
        return tweets.map((tweet, index)=>{
          return <Tweet className={"my-5 py-5 border bg-white text-dark"} tweet={tweet} key={`${index}-{tweet.id}`} />
          })
      }

export function ActionBtn(props){
    const {tweet, action} = props
    const [likes, setLikes] = useState(tweet.likes ? tweet.likes : 0)
    const [userLike, setUserLike] = useState(false)
    const classname = props.className ? props.className : 'btn btn-primary btn-sm'
    const actionDisplay = action.display ? action.display : 'Action'

    const handleClick = event => {
        event.preventDefault()
        if (action.type === 'like') {
            if (userLike) {
                setLikes(likes - 1)
                setUserLike(false)
            } else{
                setLikes(tweet.likes + 1)
                setUserLike(true)
            }
                   
        }
    }
    const display = action.type === 'like' ? `${likes} ${actionDisplay}` : actionDisplay
    return <button class={classname} onClick={handleClick}> {display}  </button> 
  }
  
  
export function Tweet(props) {
   const {tweet} = props
   const classname = props.className ? props.className : "col-10 mx-auto col-md-6"
    return <div className={classname}>
      <p>{tweet.id} - {tweet.content}</p>
      <div className='btn btn-group'>
          <ActionBtn tweet={tweet} action={{type: 'like', display: 'Likes'}}/>
          <ActionBtn tweet={tweet} action={{type: 'unlike', display: 'Unlike'}}/>
          <ActionBtn tweet={tweet} action={{type: 'retweet', display: 'Retweet'}}/>
      </div>
    </div>
  }
  