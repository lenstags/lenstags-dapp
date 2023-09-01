import { envConfig } from '@lib/config';
import { NotificationTypes, SubjectsNotifications } from '@models/notifications.models';
import * as PushAPI from '@pushprotocol/restapi';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';
import { NOTIFICATION_TYPE } from '@pushprotocol/restapi/src/lib/payloads';
import { ethers } from 'ethers';

const Pkey = `0x${envConfig.NEXT_PUBLIC_PUSH_PROTOCOL_KEY}`;
const _signer = new ethers.Wallet(Pkey)
export const channelAddress = '0xd6dd6C7e69D5Fa4178923dAc6A239F336e3c40e3'

export const getNotifications = async (address: `0x${string}` | undefined) => {
    const fetchNotifications = await PushAPI.user
        .getFeeds({
            user: `eip155:80001:${address}`, // user address in CAIP-10
            env: ENV.STAGING
        })
        .catch((err) => {
            console.log('Error fetching notifications: ', err);
        });
    console.log(fetchNotifications);
    return fetchNotifications.filter((notification: any) => notification.app === 'Nata.Social')
}

const subjects: SubjectsNotifications
    = {
    [NotificationTypes.CollectedComment]: ['collected your comment', 'collected a comment'],
    [NotificationTypes.CollectedList]: ['collected your list', 'collected a list'],
    [NotificationTypes.CollectedPost]: ['collected your post', 'collected a post'],
    [NotificationTypes.CommentedComment]: ['commented on your comment', 'commented on a comment'],
    [NotificationTypes.CommentedPost]: ['commented on your post', 'commented on a post'],
    [NotificationTypes.CreatedPost]: ['created a post', 'created a post'],
    [NotificationTypes.Followed]: ['followed you', 'followed'],
    [NotificationTypes.MentionComment]: ['mentioned you in a comment', 'mentioned in a comment'],
    [NotificationTypes.MentionPost]: ['mentioned you in a post', 'mentioned in a post'],
    [NotificationTypes.MirroredComment]: ['mirrored your comment', 'mirrored a comment'],
    [NotificationTypes.MirroredPost]: ['mirrored your post', 'mirrored a post'],
    [NotificationTypes.ReactionComment]: ['reacted to your comment', 'reacted to a comment'],
    [NotificationTypes.ReactionPost]: ['reacted to your post', 'reacted to a post'],
}

export const sendNotification = async (address: `0x${string}` | undefined | Array<`0x${string}` | undefined>, subject: NotificationTypes, profileName: string, target: number, titleContent?: string, profileId?: string) => {
    let body;
    let recipients
    if (target === NOTIFICATION_TYPE.SUBSET && Array.isArray(address)) {
        body = `${subjects[subject][1]}`
        recipients = address.map((addressFollower) => `eip155:80001:${addressFollower}`)
    } else if (target === NOTIFICATION_TYPE.TARGETTED && Array.isArray(address)) {
        body = `${subjects[subject][1]}`
        recipients = `eip155:80001:${address[0]}`
    } else {
        body = `${subjects[subject][0]}`
        recipients = `eip155:80001:${address}`
    }
    const apiResponse = await PushAPI.payloads.sendNotification({
        type: target, // subset is a list of followers
        identityType: 2,
        signer: _signer,
        notification: {
            title: profileId ?? '',
            body: body,
        },
        payload: {
            title: profileName,
            body: titleContent ?? ' ',
            cta: subject,
            img: '',
            additionalMeta: {
                type: `0+${1}`,
                data: titleContent ?? ' ',
            }
        },
        recipients,
        channel: `eip155:80001:${channelAddress}`,
        env: ENV.STAGING,
    })
        .then((res) => {
            console.log('res', res)
        })
        .catch((err) => {
            console.log('Error sending notification: ', err);
        });
    return apiResponse;
}


export const optIn = async (address: `0x${string}` | undefined, signer: any) => {
    console.log(address, signer)
    const restultOpt = await PushAPI.channels.subscribe({
        signer,
        channelAddress: 'eip155:80001:0xd6dd6C7e69D5Fa4178923dAc6A239F336e3c40e3', // channel address in CAIP
        userAddress: `eip155:80001:${address}`, // user address in CAIP
        onSuccess: () => {
            console.log('opt in success');
        },
        onError: (err) => {
            console.error('opt in error', err);
        },
        env: ENV.STAGING
    })
    return restultOpt
}


export const getSubscriptions = async (address: `0x${string}` | undefined) => {
    if (!address) return
    const fetchSubscriptions = await PushAPI.user
        .getSubscriptions({
            user: `eip155:80001:${address}`,
            env: ENV.STAGING
        })
        .then((res) => {
            return res
        })
        .catch((err) => {
            console.log('Error fetching subscriptions: ', err);
        });
    return fetchSubscriptions;
}