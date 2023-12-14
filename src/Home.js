import { useEffect } from 'react';
import React from 'react'
import { useNavigate, useParams } from 'react-router';

const Home = () => {

  const navigate = useNavigate();
  let { id } = useParams();
  var myId = id;

  useEffect(()=>{
    navigate(`/${myId}`);
  })

  return (
    <div>
    </div>
  )
}

export default Home