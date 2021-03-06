import styled from 'styled-components'
import { CVOTE_RESULT, CVOTE_RESULT_COLOR } from '@/constant'

export const Container = styled.div`
  display: flex;
  align-items: center;
  min-height: 220px;
  margin-bottom: 10px;
  &:last-child :last-child:after {
    border-bottom: none;
  }
`

export const Label = styled.div`
  text-align: right;
  margin-right: 50px;
  flex: 0 0 90px;
`

export const List = styled.div`
  position: relative;
  padding: 40px;
  /* display: ${props => (props.type === CVOTE_RESULT.REJECT ? 'block' : 'flex')}; */
  display: block;
  align-items: center;
  box-sizing: border-box;
  height: 100%;
  border-left: 10px solid;
  border-color: ${props => CVOTE_RESULT_COLOR[props.type]};
  &:after {
    content: " ";
    min-width: 500px;
    position: absolute;
    left: 5px;
    right: 5px;
    bottom: -7px;
    border-bottom: 1px solid #E5E5E5;
  }
`

export const Item = styled.div`
  text-align: center;
  margin-left: 28px;
`

export const Avatar = styled.img`
  display: block;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
`

export const ResultRow = styled.div`
  display: flex;
  margin-bottom: 30px;
`

export const Reason = styled.div`
  margin-left: 25px;
  margin-top: 10px;
`
