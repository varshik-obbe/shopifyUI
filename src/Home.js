import { useEffect } from 'react';
import React from 'react'
import { useNavigate } from 'react-router';

const Home = () => {

  const navigate = useNavigate();
  var myId = '61e7a8af6b91a9d48b531e9c';

  useEffect(()=>{
    navigate(`/${myId}`);
  })

  return (
    <div>
    </div>
  )
}

export default Home