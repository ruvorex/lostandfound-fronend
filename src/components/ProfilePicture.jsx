import React from 'react'
import { Avatar } from '@mui/material'
import { stringAvatar } from "../functions/stringAvatar";
import md5 from "md5";

function ProfilePicture(props) {
    const { user } = props
    const email_md5 = md5(user.email)
    const apiUrl = import.meta.env.VITE_API_URL;
    const s = {
        ...stringAvatar(user.name).sx,
        ...props.sx
    }
    return (
        <>
            {user.picture === "gravatar" && <Avatar {...props} src={"https://www.gravatar.com/avatar/" + email_md5 + "?&d=identicon"} />}
            {(user.picture && user.picture != "gravatar") && <Avatar {...props} src={apiUrl + "/uploads/" + user.profilePicture + "?t=" + new Date().getTime()} />}
            {!user.picture && <Avatar  {...stringAvatar(user.name) } sx={s} />}
        </>
    )
}

export default ProfilePicture