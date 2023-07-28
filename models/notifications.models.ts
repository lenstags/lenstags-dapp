export enum NotificationTypes {
    CollectedComment = 'COLLECTED_COMMENT',
    CollectedList = 'COLLECTED_LIST',
    CollectedPost = 'COLLECTED_POST',
    CommentedComment = 'COMMENTED_COMMENT',
    CommentedPost = 'COMMENTED_POST',
    Followed = 'FOLLOWED',
    MentionComment = 'MENTION_COMMENT',
    MentionPost = 'MENTION_POST',
    MirroredComment = 'MIRRORED_COMMENT',
    MirroredPost = 'MIRRORED_POST',
    ReactionComment = 'REACTION_COMMENT',
    ReactionPost = 'REACTION_POST',
}

export type SubjectsNotifications<T extends string = NotificationTypes> = {
    [key in T]: [string, string]
}