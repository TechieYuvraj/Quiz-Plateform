import React from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from '../../../axios.config';

const Test = () => {
    const user = useSelector((state) => state.auth.user);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);


    // async function fetchdata() {
    //     console.log(user, isLoggedIn)
    //     const res = await API.get("/api/user/quiz/today")
    //     console.log(res)
    // }
    // useEffect(async () => {
    //     try {
    //         // fetchdata()
    //         console.log(user, isLoggedIn)
    //         const res = await API.get("/api/user/quiz/today")
    //         console.log(res)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, [])

    const ok = useParams()
    console.log(ok)


    return (
        <div>Test</div>
    )
}

export default Test