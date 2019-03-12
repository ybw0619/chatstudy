<template>
  <div class="q-pa-md row justify-center">
    <q-dialog v-model="prompt" >
      <q-card>
        <q-card-section>
          <div class="text-h6">User Name</div>
        </q-card-section>
        <q-card-section>
          <q-input dense v-model="user" autofocus @keyup.enter="join" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="join" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div style="width: 100%; max-width: 1200px">
      <!-- <q-chat-message
        name="관리자"
        :text="['환영합니다']"
      /> -->
      <div class="card-body">
        <div class="messages" v-for="(msg, index) in messages" :key="index">
          <span v-if="msg.info != null" class="q-pa-md row justify-center">{{msg.info}}</span>
          <q-chat-message v-else :name=msg.user :sent="msg.id==socket.id" bg-color="blue-grey-11">
            {{msg.message}}
          </q-chat-message>
        </div>
      </div>
    </div>
    <q-footer class="bg-white" >
      <div class="q-pa-sm row justify-around">
        <q-input class="col-10" v-model="message" label="Message" @keyup.enter="sendMessage">
          <template v-slot:append>
            <q-icon v-if="message !== ''" name="close" @click="message = ''" class="cursor-pointer" />
          </template>
          <template v-slot:after>
            <q-btn round dense flat icon="send" @click="sendMessage"/>
          </template>
        </q-input>
      </div>
    </q-footer>
  </div>
</template>

<style>
</style>

<script>
import io from 'socket.io-client';
export default {
  data() {
        return {
            prompt:true,
            user: '',
            message: '',
            messages: [],
            socket : io('http://13.125.242.4:80'),  //본인 채팅서버 연결
            oldSocketId : '',
        }
    },
    methods: {
        join(){
          this.prompt = false
          this.socket.emit('JOIN_MESSAGE',this.user);
        },
        sendMessage(e) {
            e.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                id: this.socket.id,
                user: this.user,
                message: this.message
            });
            this.message = ''
        },
        autoscroll() {
          setTimeout(function () {
            window.scrollTo(0,document.body.scrollHeight);
          },0)
        }
    },
    watch: { //messages가 변하는지 감시
        messages:function() {
          this.autoscroll()
        },
    },
    mounted() {

        this.oldSocketId = this.socket.id;

        this.socket.on('connect',()=>{
            for(var i=0; i<this.messages.length;i++){
              if(this.messages[i].id == this.oldSocketId)
                this.messages[i].id = this.socket.id
            }
            this.oldSocketId = this.socket.id
        })

        this.socket.on('INFO', (data) => {
            this.messages = [...this.messages, data];
        });
        
        this.socket.on('MESSAGE', (data) => {
            this.messages = [...this.messages, data];
        });

        this.$nextTick(() => { //Vue.js에서 데이터갱신 후 UI까지 완료한 뒤에 nextTick에 있는 함수를 최종적으로 수행
          window.addEventListener('resize', () => { //이 이벤트가 발생할때는 키보드나 브라우저주소창 때문에 리사이즈가 발생할떄임
              if((window.scrollY + window.innerHeight*2) > document.body.scrollHeight*0.99) //키보드나 브라우저주소창 때문에 스크롤이 어디까지 내려왔는지 모르므로
                window.scrollTo(0,document.body.scrollHeight);
          });
        })
    }
}
</script>
