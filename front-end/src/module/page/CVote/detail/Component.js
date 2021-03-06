import React from 'react'
import {
  Form, Spin, Button, Input, message, Modal, Icon,
} from 'antd'
import { Link } from 'react-router-dom'
import I18N from '@/I18N'
import _ from 'lodash'
import sanitizeHtml from 'sanitize-html'
import StandardPage from '../../StandardPage'
import { LANGUAGES } from '@/config/constant'
import { CVOTE_RESULT, CVOTE_STATUS } from '@/constant'
import MetaComponent from '@/module/shared/meta/Container'
import VoteResultComponent from '../common/vote_result/Component'
import EditForm from '../edit/Container'
import Footer from '@/module/layout/Footer/Container'
import BackLink from '@/module/shared/BackLink/Component'
import CRPopover from '@/module/shared/Popover/Component'
import Translation from '@/module/common/Translation/Container'

import { Title, Label } from './style'
import './style.scss'

const { TextArea } = Input

const SubTitle = ({ dataList }) => {
  const result = _.map(dataList, (data, key) => (
    <h4 className="subtitle-item" key={key}>
      <div className="text">{data.text}</div>
      <div className="value">{data.value}</div>
    </h4>
  ))
  return <div className="subtitle-container">{result}</div>
}

class C extends StandardPage {
  constructor(props) {
    super(props)

    this.state = {
      persist: true,
      loading: false,
      language: LANGUAGES.english, // language for this specifc form only
      data: undefined,
      reason: '',
      visibleYes: false,
      visibleOppose: false,
      visibleAbstain: false,
      editing: false,
    }

    this.isLogin = this.props.isLogin
    this.user = this.props.user
  }

  componentDidMount() {
    this.refetch()
  }

  refetch = async () => {
    const data = await this.props.getData(_.get(this.props.match, 'params.id'))
    this.setState({ data })
  }

  ord_loading(f = false) {
    this.setState({ loading: f })
  }

  ord_renderContent() {
    if (!this.state.data) {
      return <div className="center"><Spin /></div>
    }
    const metaNode = this.renderMeta()
    const titleNode = this.renderTitle()
    const labelNode = this.renderLabelNode()
    const subTitleNode = this.renderSubTitle()
    const contentNode = this.renderContent()
    const notesNode = this.renderNotes()
    const voteActionsNode = this.renderVoteActions()
    const adminActionsNode = this.renderAdminActions()
    const voteDetailNode = this.renderVoteResults()
    const editFormNode = this.renderEditForm()
    const translationBtn = this.renderTranslationBtn()

    return (
      <div>
        <div className="p_CVoteDetail">
          <BackLink link="/proposals" />
          {metaNode}
          {titleNode}
          {labelNode}
          {subTitleNode}
          {contentNode}
          {translationBtn}
          {notesNode}
          {voteActionsNode}
          {adminActionsNode}
          {voteDetailNode}
          {editFormNode}
        </div>
        <Footer />
      </div>
    )
  }

  renderTranslationBtn() {
    const { title, content } = this.state.data
    const text = `
      <h1>${title}</h1>
      <p>${content}</p>
    `

    return (
      <div style={{ marginTop: 20 }}>
        <Translation text={text} />
      </div>
    )
  }

  renderEditForm() {
    return (
      <Modal
        className="project-detail-nobar"
        maskClosable={false}
        visible={this.state.editing}
        onOk={this.switchEditMode}
        onCancel={this.switchEditMode}
        footer={null}
        width="70%"
      >
        <EditForm onEdit={this.onEdit} onCancel={this.switchEditMode} />
      </Modal>
    )
  }

  switchEditMode = () => {
    const { editing } = this.state
    this.setState({
      editing: !editing,
    })
  }

  onEdit = () => {
    this.switchEditMode()
    this.refetch()
  }

  renderMeta() {
    const { data } = this.state
    data.author = data.proposedBy
    data.displayId = data.vid
    const postedByText = I18N.get('from.CVoteForm.label.proposedby')
    return <MetaComponent data={data} postedByText={postedByText} />
  }

  renderTitle() {
    const { title } = this.state.data
    return <Title>{title}</Title>
  }

  renderSubTitle() {
    const { data } = this.state
    const statusObj = {
      text: I18N.get('from.CVoteForm.label.voteStatus'),
      value: I18N.get(`cvoteStatus.${data.status}`) || '',
    }

    const publishObj = {
      text: I18N.get('from.CVoteForm.label.publish'),
      value: data.published ? I18N.get('.yes') : I18N.get('.no'),
    }

    const typeMap = {
      1: I18N.get('council.voting.type.newMotion'),
      2: I18N.get('council.voting.type.motionAgainst'),
      3: I18N.get('council.voting.type.anythingElse'),
    }

    const typeObj = {
      text: I18N.get('from.CVoteForm.label.type'),
      value: typeMap[data.type],
    }

    const voteObj = {
      text: I18N.get('council.voting.ifConflicted'),
      value: data.isConflict === 'YES' ? I18N.get('.yes') : I18N.get('.no'),
    }

    const dataList = [
      statusObj,
      publishObj,
      typeObj,
      voteObj,
    ]
    return <SubTitle dataList={dataList} />
  }

  renderLabelNode() {
    const reference = _.get(this.state.data, 'reference')
    if (_.isEmpty(reference)) return null
    const { _id, displayId } = reference
    const linkText = `${I18N.get('suggestion.suggestion')} #${displayId}`
    return (
      <Label>
        {`${I18N.get('council.voting.referred')} `}
        <Link to={`/suggestion/${_id}`}>{linkText}</Link>
      </Label>
    )
  }

  renderContent() {
    const { content } = this.state.data
    return <div className="content ql-editor" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
  }

  renderNotes() {
    const { notes, notes_zh } = this.state.data
    if (!notes && !notes_zh) return null
    return (
      <div className="content notes">
        <h4 className="notes-title">{I18N.get('council.voting.btnText.notesSecretary')}</h4>
        <p className="notes-content">{notes}</p>
        <p className="notes-content">{notes_zh}</p>
      </div>
    )
  }

  renderVoteActions() {
    const { isCouncil } = this.props
    const { status } = this.state.data
    const canVote = isCouncil && status === CVOTE_STATUS.PROPOSED

    if (!canVote) return null
    const { visibleYes, visibleOppose, visibleAbstain } = this.state
    const btnYes = (
      <Button
        type="primary"
        icon="check-circle"
        onClick={this.showVoteYesModal}
      >
        {I18N.get('council.voting.btnText.yes')}
      </Button>
    )
    const btnOppose = (
      <Button
        type="danger"
        icon="close-circle"
        onClick={this.showVoteOpposeModal}
      >
        {I18N.get('council.voting.btnText.no')}
      </Button>
    )
    const btnAbstain = (
      <Button
        icon="stop"
        onClick={this.showVoteAbstainModal}
      >
        {I18N.get('council.voting.btnText.abstention')}
      </Button>
    )

    const popOverYes = (
      <CRPopover
        triggeredBy={btnYes}
        visible={visibleYes}
        onToggle={this.showVoteYesModal}
        onSubmit={this.voteYes}
        btnType="primary"
      />
    )
    const popOverOppose = (
      <CRPopover
        triggeredBy={btnOppose}
        visible={visibleOppose}
        onToggle={this.showVoteOpposeModal}
        onSubmit={this.voteOppose}
        btnType="danger"
      />
    )
    const popOverAbstain = (
      <CRPopover
        triggeredBy={btnAbstain}
        visible={visibleAbstain}
        onToggle={this.showVoteAbstainModal}
        onSubmit={this.voteAbstain}
      />
    )

    return (
      <div className="vote-btn-group">
        {popOverYes}
        {popOverOppose}
        {popOverAbstain}
      </div>
    )
  }

  renderAdminActions() {
    const { isSecretary, isCouncil, currentUserId } = this.props
    const { status, createdBy, notes } = this.state.data
    const isSelf = currentUserId === createdBy
    const isCompleted = status === CVOTE_STATUS.FINAL
    const canManage = isSecretary || isCouncil
    const canEdit = _.includes([CVOTE_STATUS.DRAFT], status)
    const canComplete = _.includes([CVOTE_STATUS.ACTIVE, CVOTE_STATUS.REJECT, CVOTE_STATUS.DEFERRED], status)

    if (!canManage || isCompleted) return null

    const noteBtnText = notes ? I18N.get('council.voting.btnText.editNotes') : I18N.get('council.voting.btnText.notesSecretary')
    const addNoteBtn = isSecretary && (
      <Button
        icon="profile"
        onClick={this.showUpdateNotesModal}
      >
        {noteBtnText}
      </Button>
    )
    const editProposalBtn = isSelf && canEdit && (
      <Button
        icon="edit"
        onClick={this.switchEditMode}
      >
        {I18N.get('council.voting.btnText.editProposal')}
      </Button>
    )
    const completeProposalBtn = isSecretary && canComplete && (
      <Button
        icon="check-square"
        type="primary"
        onClick={this.completeProposal}
      >
        {I18N.get('council.voting.btnText.completeProposal')}
      </Button>
    )
    return (
      <div className="vote-btn-group">
        {addNoteBtn}
        {editProposalBtn}
        {completeProposalBtn}
      </div>
    )
  }

  onNotesChanged = (e) => {
    this.setState({ notes: e.target.value })
  }

  showUpdateNotesModal = () => {
    const { notes } = this.state.data
    Modal.confirm({
      title: I18N.get('council.voting.modal.updateNotes'),
      content: <TextArea onChange={this.onNotesChanged} defaultValue={notes} />,
      okText: I18N.get('council.voting.modal.confirm'),
      cancelText: I18N.get('council.voting.modal.cancel'),
      onOk: () => this.updateNotes(),
    })
  }

  async updateNotes() {
    const { notes } = this.state
    const id = _.get(this.props.match, 'params.id')

    if (_.isEmpty(notes)) return
    this.ord_loading(true)
    try {
      await this.props.updateNotes({
        _id: id,
        notes,
      })
      message.success(I18N.get('from.CVoteForm.message.note.update.success'))
      this.refetch()
      this.ord_loading(false)
    } catch (error) {
      message.error(error.message)
      this.ord_loading(false)
    }
  }

  renderVoteResults() {
    const { vote_map: voteMap, reason_map: reasonMap, voteResult, status } = this.state.data
    const { avatar_map: avatarMap } = this.props
    let stats

    if (status === CVOTE_STATUS.DRAFT) return null

    if (!_.isEmpty(voteResult)) {
      stats = _.reduce(voteResult, (prev, cur) => {
        const item = {
          name: `${_.get(cur, 'votedBy.profile.firstName')} ${_.get(cur, 'votedBy.profile.lastName')} `,
          avatar: _.get(cur, 'votedBy.profile.avatar'),
          reason: cur.reason,
        }
        if (prev[cur.value]) {
          prev[cur.value].push(item)
          return prev
        }
        return _.extend(prev, { [cur.value]: [item] })
      }, {})
    } else if (!_.isEmpty(voteMap)) {
      // for legacy data structure
      stats = _.reduce(voteMap, (prev, value, key) => {
        const item = { name: key, avatar: _.get(avatarMap, key), reason: _.get(reasonMap, key) }
        if (prev[value]) {
          prev[value].push(item)
          return prev
        }
        return _.extend(prev, { [value]: [item] })
      }, {})
    }

    const title = <h2>{I18N.get('council.voting.councilMembersVotes')}</h2>
    const detail = _.map(stats, (statArr, key) => {
      const type = (CVOTE_RESULT[key.toUpperCase()] || CVOTE_RESULT.UNDECIDED)
      const label = I18N.get(`council.voting.type.${type}`)
      const props = {
        dataList: statArr,
        type,
        label,
      }
      return <VoteResultComponent {...props} key={key} />
    })
    return (
      <div>
        {title}
        <div>{detail}</div>
      </div>
    )
  }

  async vote({ value, reason }) {
    const { match, vote } = this.props
    const id = _.get(match, 'params.id')

    const param = { _id: id, value, reason }

    this.ord_loading(true)
    try {
      await vote(param)
      message.success(I18N.get('from.CVoteForm.message.updated.success'))
      this.refetch()
      this.ord_loading(false)
    } catch (e) {
      message.error(e.message)
      this.ord_loading(false)
    }
  }

  voteYes = ({ reason }) => {
    this.vote({ value: CVOTE_RESULT.SUPPORT, reason })
    this.setState({ reason: '' })
  }

  voteAbstain = ({ reason }) => {
    this.vote({ value: CVOTE_RESULT.ABSTENTION, reason })
    this.setState({ reason: '' })
  }

  voteOppose = ({ reason }) => {
    this.vote({ value: CVOTE_RESULT.REJECT, reason })
    this.setState({ reason: '' })
  }

  showVoteYesModal = () => {
    const { visibleYes } = this.state
    this.setState({ visibleYes: !visibleYes })
  }

  showVoteAbstainModal = () => {
    const { visibleAbstain } = this.state
    this.setState({ visibleAbstain: !visibleAbstain })
  }

  showVoteOpposeModal = () => {
    const { visibleOppose } = this.state
    this.setState({ visibleOppose: !visibleOppose })
  }

  completeProposal = () => {
    const id = _.get(this.props.match, 'params.id')

    Modal.confirm({
      title: I18N.get('council.voting.modal.complete'),
      content: '',
      okText: I18N.get('council.voting.modal.confirm'),
      cancelText: I18N.get('council.voting.modal.cancel'),
      onOk: () => {
        this.ord_loading(true)
        this.props.finishCVote({
          id,
        }).then(() => {
          message.success(I18N.get('from.CVoteForm.message.proposal.update.success'))
          this.refetch()
          this.ord_loading(false)
        }).catch((e) => {
          message.error(e.message)
          this.ord_loading(false)
        })
      },
    })
  }
}

export default Form.create()(C)
